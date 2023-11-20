package database

import (
	"context"
	"fmt"
	"log"
	"strings"

	"github.com/dominikbraun/graph"
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	databaseModel "github.com/fastenhealth/fasten-onprem/backend/pkg/models/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/utils"
	"golang.org/x/exp/slices"
)

type VertexResourcePlaceholder struct {
	UserID                     string
	SourceID                   string
	ResourceID                 string
	ResourceType               string
	RelatedResourcePlaceholder []*VertexResourcePlaceholder
}

func (rp *VertexResourcePlaceholder) ID() string {
	return resourceKeysVertexId(rp.SourceID, rp.ResourceType, rp.ResourceID)
}

// Retrieve a list of all fhir resources (vertex), and a list of all associations (edge)
// Generate a graph
// return list of root nodes, and their flattened related resources.
func (gr *GormRepository) GetFlattenedResourceGraph(ctx context.Context, graphType pkg.ResourceGraphType, options models.ResourceGraphOptions) (map[string][]*models.ResourceBase, error) {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	// Get list of all (non-reciprocal) relationships
	var relatedResourceRelationships []models.RelatedResource

	// SELECT * FROM related_resources WHERE user_id = "53c1e930-63af-46c9-b760-8e83cbc1abd9";
	result := gr.GormClient.WithContext(ctx).
		Where(models.RelatedResource{
			ResourceBaseUserID: currentUser.ID,
		}).
		Find(&relatedResourceRelationships)
	if result.Error != nil {
		return nil, result.Error
	}
	log.Printf("found %d related resources", len(relatedResourceRelationships))

	//Generate Graph
	// TODO optimization: eventually cache the graph in a database/storage, and update when new resources are added.
	g := graph.New(resourceVertexId, graph.Directed(), graph.Acyclic(), graph.Rooted())

	//add vertices to the graph (must be done first)
	//we don't want to request all resources from the database, so we will create a placeholder vertex for each resource.
	//we will then use the vertex id to lookup the resource from the database.
	//this is a bit of a hack, but it allows us to use the graph library without having to load all resources into memory.

	//create a placeholder vertex for each resource (ensuring uniqueness)
	resourcePlaceholders := map[string]VertexResourcePlaceholder{}
	for _, relationship := range relatedResourceRelationships {

		//create placeholders
		fromResourcePlaceholder := VertexResourcePlaceholder{
			UserID:       relationship.ResourceBaseUserID.String(),
			SourceID:     relationship.ResourceBaseSourceID.String(),
			ResourceID:   relationship.ResourceBaseSourceResourceID,
			ResourceType: relationship.ResourceBaseSourceResourceType,
		}

		toResourcePlaceholder := VertexResourcePlaceholder{
			UserID:       relationship.RelatedResourceUserID.String(),
			SourceID:     relationship.RelatedResourceSourceID.String(),
			ResourceID:   relationship.RelatedResourceSourceResourceID,
			ResourceType: relationship.RelatedResourceSourceResourceType,
		}

		//add placeholders to map, if they don't already exist
		if _, ok := resourcePlaceholders[fromResourcePlaceholder.ID()]; !ok {
			resourcePlaceholders[fromResourcePlaceholder.ID()] = fromResourcePlaceholder
		}
		if _, ok := resourcePlaceholders[toResourcePlaceholder.ID()]; !ok {
			resourcePlaceholders[toResourcePlaceholder.ID()] = toResourcePlaceholder
		}
	}

	for ndx, _ := range resourcePlaceholders {
		resourcePlaceholder := resourcePlaceholders[ndx]
		log.Printf("Adding vertex: %v", resourcePlaceholder.ID())
		err := g.AddVertex(
			&resourcePlaceholder,
		)
		if err != nil {
			return nil, fmt.Errorf("an error occurred while adding vertex: %v", err)
		}
	}

	//add recriprocial relationships (depending on the graph type)
	relatedResourceRelationships = gr.PopulateGraphTypeReciprocalRelationships(graphType, relatedResourceRelationships)

	//add edges to graph
	for _, relationship := range relatedResourceRelationships {

		err := g.AddEdge(
			resourceKeysVertexId(relationship.ResourceBaseSourceID.String(), relationship.ResourceBaseSourceResourceType, relationship.ResourceBaseSourceResourceID),
			resourceKeysVertexId(relationship.RelatedResourceSourceID.String(), relationship.RelatedResourceSourceResourceType, relationship.RelatedResourceSourceResourceID),
		)

		if err != nil {
			//this may occur because vertices may not exist
			gr.Logger.Warnf("ignoring, an error occurred while adding edge: %v", err)
		}
	}

	//// simplify graph if possible.
	//graph.TransitiveReduction(g)

	// AdjacencyMap computes and returns an adjacency map containing all vertices in the graph.
	//
	// There is an entry for each vertex, and each of those entries is another map whose keys are
	// the hash values of the adjacent vertices. The value is an Edge instance that stores the
	// source and target hash values (these are the same as the map keys) as well as edge metadata.
	//	map[string]map[string]Edge[string]{
	//		"A": map[string]Edge[string]{
	//			"B": {Source: "A", Target: "B"}
	//			"C": {Source: "A", Target: "C"}
	//		}
	//	}
	adjacencyMap, err := g.AdjacencyMap()
	if err != nil {
		return nil, fmt.Errorf("error while generating AdjacencyMap: %v", err)
	}

	// For a directed graph, PredecessorMap is the complement of AdjacencyMap. This is because in a directed graph, only
	// vertices joined by an outgoing edge are considered adjacent to the current vertex, whereas
	// predecessors are the vertices joined by an ingoing edge.
	// ie. "empty" verticies in this map are "root" nodes.
	predecessorMap, err := g.PredecessorMap()
	if err != nil {
		return nil, fmt.Errorf("error while generating PredecessorMap: %v", err)
	}

	// Doing this in one massive function, because passing graph by reference is difficult due to generics.

	// Step 1: use predecessorMap to find all "root" resources (eg. MedicalHistory - encounters and EOB). store those nodes in their respective lists.
	resourcePlaceholderListDictionary := map[string][]*VertexResourcePlaceholder{}
	sources, _, sourceFlattenLevel := getSourcesAndSinksForGraphType(graphType)

	for vertexId, val := range predecessorMap {

		if len(val) != 0 {
			//skip any nodes/verticies/resources that are not "root"
			continue
		}

		resourcePlaceholder, err := g.Vertex(vertexId)
		if err != nil {
			//could not find this vertex in graph, ignoring
			log.Printf("could not find vertex in graph: %v", err)
			continue
		}

		//check if this "root" node (which has no predecessors) is a valid source type
		foundSourceType := ""
		foundSourceLevel := -1
		for ndx, sourceResourceTypes := range sources {
			log.Printf("testing resourceType: %s", resourcePlaceholder.ResourceType)

			if slices.Contains(sourceResourceTypes, strings.ToLower(resourcePlaceholder.ResourceType)) {
				foundSourceType = resourcePlaceholder.ResourceType
				foundSourceLevel = ndx
				break
			}
		}

		if foundSourceLevel == -1 {
			continue //skip this resourcePlaceholder, it is not a valid source type
		}

		if _, ok := resourcePlaceholderListDictionary[foundSourceType]; !ok {
			resourcePlaceholderListDictionary[foundSourceType] = []*VertexResourcePlaceholder{}
		}

		resourcePlaceholderListDictionary[foundSourceType] = append(resourcePlaceholderListDictionary[foundSourceType], resourcePlaceholder)
	}

	// Step 2: now that we've created a relationship graph using placeholders, we need to determine which page of resources to return
	// and look up the actual resources from the database.

	resourceListDictionary, err := gr.InflateSelectedResourcesInResourceGraph(currentUser, resourcePlaceholderListDictionary, options)
	if err != nil {
		return nil, fmt.Errorf("error while paginating & inflating resource graph: %v", err)
	}

	// Step 3: define a function. When given a resource, should find all related resources, flatten the heirarchy and set the RelatedResourceFhir list
	flattenRelatedResourcesFn := func(resource *models.ResourceBase) {
		// this is a "root" encounter, which is not related to any condition, we should add it to the Unknown encounters list
		vertexId := resourceVertexId(&VertexResourcePlaceholder{
			ResourceType: resource.SourceResourceType,
			ResourceID:   resource.SourceResourceID,
			SourceID:     resource.SourceID.String(),
			UserID:       resource.UserID.String(),
		})
		gr.Logger.Debugf("populating resourcePlaceholder: %s", vertexId)

		resource.RelatedResource = []*models.ResourceBase{}

		//get all the resource placeholders associated with this node
		//TODO: handle error?
		graph.DFS(g, vertexId, func(relatedVertexId string) bool {
			relatedResourcePlaceholder, _ := g.Vertex(relatedVertexId)
			//skip the current resourcePlaceholder if it's referenced in this list.
			//also skip the current resourcePlaceholder if its a Binary resourcePlaceholder (which is a special case)
			if vertexId != resourceVertexId(relatedResourcePlaceholder) && relatedResourcePlaceholder.ResourceType != "Binary" {
				relatedResource, err := gr.GetResourceByResourceTypeAndId(ctx, relatedResourcePlaceholder.ResourceType, relatedResourcePlaceholder.ResourceID)
				if err != nil {
					gr.Logger.Warnf("ignoring, cannot safely handle error which occurred while getting related resource: %v", err)
					return true
				}
				resource.RelatedResource = append(
					resource.RelatedResource,
					relatedResource,
				)
			}
			return false
		})
	}

	// Step 4: flatten resources (if needed) and sort them
	for resourceType, _ := range resourceListDictionary {
		sourceFlatten, sourceFlattenOk := sourceFlattenLevel[strings.ToLower(resourceType)]

		if sourceFlattenOk && sourceFlatten == true {
			//if flatten is set to true, we want to flatten the graph. This is usually for non primary source types (eg. Encounter is a source type, but Condition is the primary source type)

			// Step 3: populate related resources for each encounter, flattened
			for ndx, _ := range resourceListDictionary[resourceType] {
				// this is a "root" encounter, which is not related to any condition, we should add it to the Unknown encounters list
				flattenRelatedResourcesFn(resourceListDictionary[resourceType][ndx])

				//sort all related resources (by date, desc)
				resourceListDictionary[resourceType][ndx].RelatedResource = utils.SortResourcePtrListByDate(resourceListDictionary[resourceType][ndx].RelatedResource)
			}
		} else {
			// if flatten is set to false, we want to preserve the top relationships in the graph heirarchy. This is usually for primary source types (eg. Condition is the primary source type)
			// we want to ensure context is preserved, so we will flatten the graph futher down in the heirarchy

			// Step 4: find all encounters referenced by the root conditions, populate them, then add them to the condition as RelatedResourceFhir
			for ndx, _ := range resourceListDictionary[resourceType] {
				// this is a "root" condition,

				resourceListDictionary[resourceType][ndx].RelatedResource = []*models.ResourceBase{}
				currentResource := resourceListDictionary[resourceType][ndx]
				vertexId := resourceKeysVertexId(currentResource.SourceID.String(), currentResource.SourceResourceType, currentResource.SourceResourceID)
				for relatedVertexId, _ := range adjacencyMap[vertexId] {
					relatedResourcePlaceholder, _ := g.Vertex(relatedVertexId)
					relatedResourceFhir, err := gr.GetResourceByResourceTypeAndId(ctx, relatedResourcePlaceholder.ResourceType, relatedResourcePlaceholder.ResourceID)
					if err != nil {
						gr.Logger.Warnf("ignoring, cannot safely handle error which occurred while getting related resource (flatten=false): %v", err)
						continue
					}
					flattenRelatedResourcesFn(relatedResourceFhir)
					resourceListDictionary[resourceType][ndx].RelatedResource = append(resourceListDictionary[resourceType][ndx].RelatedResource, relatedResourceFhir)
				}

				//sort all related resources (by date, desc)
				resourceListDictionary[resourceType][ndx].RelatedResource = utils.SortResourcePtrListByDate(resourceListDictionary[resourceType][ndx].RelatedResource)
			}
		}

		resourceListDictionary[resourceType] = utils.SortResourcePtrListByDate(resourceListDictionary[resourceType])
	}

	// Step 5: return the populated resource list dictionary

	return resourceListDictionary, nil
}

// InflateSelectedResourcesInResourceGraph - this function will take a dictionary of placeholder "sources" graph and load the selected resources (and their descendants) from the database.
// - first, it will load all the "source" resources (eg. Encounter, Condition, etc)
// - sort the root resources by date, desc
// - use the page number + page size to determine which root resources to return
// - return a dictionary of "source" resource lists
func (gr *GormRepository) InflateSelectedResourcesInResourceGraph(currentUser *models.User, resourcePlaceholderListDictionary map[string][]*VertexResourcePlaceholder, options models.ResourceGraphOptions) (map[string][]*models.ResourceBase, error) {

	// Step 3a: group the selected resources by type, so we only need to do 1 query per type
	selectedResourceIdsByResourceType := map[string][]models.OriginBase{}

	for _, resourceId := range options.ResourcesIds {
		if _, ok := selectedResourceIdsByResourceType[resourceId.SourceResourceType]; !ok {
			selectedResourceIdsByResourceType[resourceId.SourceResourceType] = []models.OriginBase{}
		}
		selectedResourceIdsByResourceType[resourceId.SourceResourceType] = append(selectedResourceIdsByResourceType[resourceId.SourceResourceType], resourceId)
	}

	// Step 3b: query the database for all the selected resources

	//TODO: maybe its more performant to query each resource by type/id/source, since they are indexed already?
	rootWrappedResourceModels := []models.ResourceBase{}
	for resourceType, _ := range selectedResourceIdsByResourceType {
		// selectedResourceIdsByResourceType contains selected resources grouped by ty[e types (eg. Encounter, Condition, etc)

		//convert these to a list of interface{} for the query
		selectList := [][]interface{}{}
		for ndx, _ := range selectedResourceIdsByResourceType[resourceType] {

			selectedResource := selectedResourceIdsByResourceType[resourceType][ndx]

			selectList = append(selectList, []interface{}{
				currentUser.ID,
				selectedResource.SourceID,
				selectedResource.SourceResourceType,
				selectedResource.SourceResourceID,
			})
		}

		tableName, err := databaseModel.GetTableNameByResourceType(resourceType)
		if err != nil {
			return nil, err
		}
		var tableWrappedResourceModels []models.ResourceBase
		gr.GormClient.
			Where("(user_id, source_id, source_resource_type, source_resource_id) IN ?", selectList).
			Table(tableName).
			Find(&tableWrappedResourceModels)

		//append these resources to the rootWrappedResourceModels list
		rootWrappedResourceModels = append(rootWrappedResourceModels, tableWrappedResourceModels...)
	}

	//sort
	rootWrappedResourceModels = utils.SortResourceListByDate(rootWrappedResourceModels)

	// Step 3c: now that we have the selected root resources, lets generate a dictionary of resource lists, keyed by resource type
	resourceListDictionary := map[string][]*models.ResourceBase{}
	for ndx, _ := range rootWrappedResourceModels {
		resourceType := rootWrappedResourceModels[ndx].SourceResourceType
		if _, ok := resourceListDictionary[resourceType]; !ok {
			resourceListDictionary[resourceType] = []*models.ResourceBase{}
		}
		resourceListDictionary[resourceType] = append(resourceListDictionary[resourceType], &rootWrappedResourceModels[ndx])
	}

	// Step 4: return the populated resource list dictionary
	return resourceListDictionary, nil
}

// We need to support the following types of graphs:
// - Medical History
// - AddressBook (contacts)
// - Medications
// - Billing Report
// edges are always "strongly connected", however "source" nodes (roots, like Condition or Encounter -- depending on ) are only one way.
// add an edge from every resource to its related resource. Keep in mind that FHIR resources may not contain reciprocal edges, so we ensure the graph is rooted by flipping any
// related resources that are "Condition" or "Encounter"
func (gr *GormRepository) PopulateGraphTypeReciprocalRelationships(graphType pkg.ResourceGraphType, relationships []models.RelatedResource) []models.RelatedResource {
	reciprocalRelationships := []models.RelatedResource{}

	//prioritized lists of sources and sinks for the graph. We will use these to determine which resources are "root" nodes.
	sources, sinks, _ := getSourcesAndSinksForGraphType(graphType)

	for _, relationship := range relationships {

		//calculate the
		resourceAGraphSourceLevel := foundResourceGraphSource(relationship.ResourceBaseSourceResourceType, sources)
		resourceBGraphSourceLevel := foundResourceGraphSource(relationship.RelatedResourceSourceResourceType, sources)

		resourceAGraphSinkLevel := foundResourceGraphSink(relationship.ResourceBaseSourceResourceType, sinks)
		resourceBGraphSinkLevel := foundResourceGraphSink(relationship.RelatedResourceSourceResourceType, sinks)

		if resourceAGraphSourceLevel > -1 && resourceBGraphSourceLevel > -1 {
			//handle the case where both resources are "sources" (eg. MedicalHistory - Condition or Encounter)
			if resourceAGraphSourceLevel <= resourceBGraphSourceLevel {
				//A is a higher priority than B, so we will add an edge from A to B
				reciprocalRelationships = append(reciprocalRelationships, relationship)
			} else {
				//B is a higher priority than A, so we will add an edge from B to A (flipped relationship)
				reciprocalRelationships = append(reciprocalRelationships, models.RelatedResource{
					ResourceBaseUserID:                relationship.RelatedResourceUserID,
					ResourceBaseSourceID:              relationship.RelatedResourceSourceID,
					ResourceBaseSourceResourceType:    relationship.RelatedResourceSourceResourceType,
					ResourceBaseSourceResourceID:      relationship.RelatedResourceSourceResourceID,
					RelatedResourceUserID:             relationship.ResourceBaseUserID,
					RelatedResourceSourceID:           relationship.ResourceBaseSourceID,
					RelatedResourceSourceResourceType: relationship.ResourceBaseSourceResourceType,
					RelatedResourceSourceResourceID:   relationship.ResourceBaseSourceResourceID,
				})
			}

		} else if resourceAGraphSourceLevel > -1 || resourceBGraphSinkLevel > -1 {
			//resource A is a Source, or resource B is a sink, normal A -> B relationship (edge)
			reciprocalRelationships = append(reciprocalRelationships, relationship)

		} else if resourceBGraphSourceLevel > -1 || resourceAGraphSinkLevel > -1 {
			//resource B is a Source, or resource A is a sink, create B -> A relationship (edge)

			reciprocalRelationships = append(reciprocalRelationships, models.RelatedResource{
				ResourceBaseUserID:                relationship.RelatedResourceUserID,
				ResourceBaseSourceID:              relationship.RelatedResourceSourceID,
				ResourceBaseSourceResourceType:    relationship.RelatedResourceSourceResourceType,
				ResourceBaseSourceResourceID:      relationship.RelatedResourceSourceResourceID,
				RelatedResourceUserID:             relationship.ResourceBaseUserID,
				RelatedResourceSourceID:           relationship.ResourceBaseSourceID,
				RelatedResourceSourceResourceType: relationship.ResourceBaseSourceResourceType,
				RelatedResourceSourceResourceID:   relationship.ResourceBaseSourceResourceID,
			})

		} else {
			//this is a regular pair of resources, create reciprocal edges

			reciprocalRelationships = append(reciprocalRelationships, relationship)

			reciprocalRelationships = append(reciprocalRelationships, models.RelatedResource{
				ResourceBaseUserID:                relationship.RelatedResourceUserID,
				ResourceBaseSourceID:              relationship.RelatedResourceSourceID,
				ResourceBaseSourceResourceType:    relationship.RelatedResourceSourceResourceType,
				ResourceBaseSourceResourceID:      relationship.RelatedResourceSourceResourceID,
				RelatedResourceUserID:             relationship.ResourceBaseUserID,
				RelatedResourceSourceID:           relationship.ResourceBaseSourceID,
				RelatedResourceSourceResourceType: relationship.ResourceBaseSourceResourceType,
				RelatedResourceSourceResourceID:   relationship.ResourceBaseSourceResourceID,
			})
		}

	}

	return reciprocalRelationships
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Utilities
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

func getSourcesAndSinksForGraphType(graphType pkg.ResourceGraphType) ([][]string, [][]string, map[string]bool) {
	var sources [][]string
	var sinks [][]string
	var sourceFlattenRelated map[string]bool
	switch graphType {
	case pkg.ResourceGraphTypeMedicalHistory:
		sources = [][]string{
			{"encounter", "explanationofbenefit"},
		}
		sinks = [][]string{
			{"condition", "composition", "location", "device", "organization", "practitioner", "medication", "patient", "coverage"}, //resources that are shared across multiple conditions
			{"binary"},
		}
		sourceFlattenRelated = map[string]bool{
			"encounter": true,
		}
		break
	case pkg.ResourceGraphTypeAddressBook:
		sources = [][]string{
			{"practitioner", "organization"},
			{"practitionerrole", "careteam", "location"},
		}
		sinks = [][]string{
			{"condition", "composition", "explanationofbenefits"}, //resources that are shared across multiple practitioners
			{"encounter", "medication", "patient"},
		}
		sourceFlattenRelated = map[string]bool{}
	}
	return sources, sinks, sourceFlattenRelated
}

// source resource types are resources that are at the root of the graph, nothing may reference them directly
// loop though the list of source resource types, and see if the checkResourceType is one of them
func foundResourceGraphSource(checkResourceType string, sourceResourceTypes [][]string) int {
	found := -1
	for i, sourceResourceType := range sourceResourceTypes {
		if slices.Contains(sourceResourceType, strings.ToLower(checkResourceType)) {
			found = i
			break
		}
	}
	return found
}

// sink resource types are the leaves of the graph, they must not reference anything else. (only be referenced)
func foundResourceGraphSink(checkResourceType string, sinkResourceTypes [][]string) int {
	found := -1
	for i, sinkResourceType := range sinkResourceTypes {
		if slices.Contains(sinkResourceType, strings.ToLower(checkResourceType)) {
			found = i
			break
		}
	}
	return found
}

// helper function for GetResourceGraph, creating a "hash" for the resource
func resourceVertexId(resourcePlaceholder *VertexResourcePlaceholder) string {
	return resourceKeysVertexId(resourcePlaceholder.SourceID, resourcePlaceholder.ResourceType, resourcePlaceholder.ResourceID)
}
func resourceKeysVertexId(sourceId string, resourceType string, resourceId string) string {
	return strings.ToLower(fmt.Sprintf("%s/%s/%s", sourceId, resourceType, resourceId))
}
