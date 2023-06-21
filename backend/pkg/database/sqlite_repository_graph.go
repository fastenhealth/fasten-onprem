package database

import (
	"context"
	"fmt"
	"github.com/dominikbraun/graph"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/utils"
	"golang.org/x/exp/slices"
	"log"
	"strings"
)

// Retrieve a list of all fhir resources (vertex), and a list of all associations (edge)
// Generate a graph
// return list of root nodes, and their flattened related resources.
func (sr *SqliteRepository) GetFlattenedResourceGraph(ctx context.Context, graphType pkg.ResourceGraphType) (map[string][]*models.ResourceBase, error) {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	// Get list of all resources
	wrappedResourceModels, err := sr.ListResources(ctx, models.ListResourceQueryOptions{})
	if err != nil {
		return nil, err
	}

	// Get list of all (non-reciprocal) relationships
	var relatedResourceRelationships []models.RelatedResource

	// SELECT * FROM related_resources WHERE user_id = "53c1e930-63af-46c9-b760-8e83cbc1abd9";
	result := sr.GormClient.WithContext(ctx).
		Table("related_resources").
		Where(models.RelatedResource{
			ResourceFhirUserID: currentUser.ID,
		}).
		Scan(&relatedResourceRelationships)
	if result.Error != nil {
		return nil, result.Error
	}

	//Generate Graph
	// TODO optimization: eventually cache the graph in a database/storage, and update when new resources are added.
	g := graph.New(resourceVertexId, graph.Directed(), graph.Acyclic(), graph.Rooted())

	//add vertices to the graph (must be done first)
	for ndx, _ := range wrappedResourceModels {
		err = g.AddVertex(
			&wrappedResourceModels[ndx],
		)
		if err != nil {
			return nil, fmt.Errorf("an error occurred while adding vertex: %v", err)
		}
	}

	//add recriprocial relationships (depending on the graph type)
	relatedResourceRelationships = sr.PopulateGraphTypeReciprocalRelationships(graphType, relatedResourceRelationships)

	//add edges to graph
	for _, relationship := range relatedResourceRelationships {

		err = g.AddEdge(
			resourceKeysVertexId(relationship.ResourceFhirSourceID.String(), relationship.ResourceFhirSourceResourceType, relationship.ResourceFhirSourceResourceID),
			resourceKeysVertexId(relationship.RelatedResourceFhirSourceID.String(), relationship.RelatedResourceFhirSourceResourceType, relationship.RelatedResourceFhirSourceResourceID),
		)

		if err != nil {
			//this may occur because vertices may not exist
			sr.Logger.Warnf("ignoring, an error occurred while adding edge: %v", err)
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

	// Step 1: use predecessorMap to find all "root" resources (eg. MedicalHistory - encounters and conditions). store those nodes in their respective lists.
	resourceListDictionary := map[string][]*models.ResourceBase{}
	sources, _, sourceFlattenLevel := getSourcesAndSinksForGraphType(graphType)

	for vertexId, val := range predecessorMap {

		if len(val) != 0 {
			//skip any nodes/verticies/resources that are not "root"
			continue
		}

		resource, err := g.Vertex(vertexId)
		if err != nil {
			//could not find this vertex in graph, ignoring
			log.Printf("could not find vertex in graph: %v", err)
			continue
		}

		//check if this "root" node (which has no predecessors) is a valid source type
		foundSourceType := ""
		foundSourceLevel := -1
		for ndx, sourceResourceTypes := range sources {
			log.Printf("testing resourceType: %s", resource.SourceResourceType)

			if slices.Contains(sourceResourceTypes, strings.ToLower(resource.SourceResourceType)) {
				foundSourceType = resource.SourceResourceType
				foundSourceLevel = ndx
				break
			}
		}

		if foundSourceLevel == -1 {
			continue //skip this resource, it is not a valid source type
		}

		if _, ok := resourceListDictionary[foundSourceType]; !ok {
			resourceListDictionary[foundSourceType] = []*models.ResourceBase{}
		}

		resourceListDictionary[foundSourceType] = append(resourceListDictionary[foundSourceType], resource)
	}

	// Step 2: define a function. When given a resource, should find all related resources, flatten the heirarchy and set the RelatedResourceFhir list
	flattenRelatedResourcesFn := func(resource *models.ResourceBase) {
		// this is a "root" encounter, which is not related to any condition, we should add it to the Unknown encounters list
		vertexId := resourceVertexId(resource)
		sr.Logger.Debugf("populating resource: %s", vertexId)

		resource.RelatedResource = []*models.ResourceBase{}

		//get all the resources associated with this node
		graph.DFS(g, vertexId, func(relatedVertexId string) bool {
			relatedResourceFhir, _ := g.Vertex(relatedVertexId)
			//skip the current resource if it's referenced in this list.
			//also skip the current resource if its a Binary resource (which is a special case)
			if vertexId != resourceVertexId(relatedResourceFhir) && relatedResourceFhir.SourceResourceType != "Binary" {
				resource.RelatedResource = append(resource.RelatedResource, relatedResourceFhir)
			}
			return false
		})
	}

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
				vertexId := resourceVertexId(resourceListDictionary[resourceType][ndx])
				for relatedVertexId, _ := range adjacencyMap[vertexId] {
					relatedResourceFhir, _ := g.Vertex(relatedVertexId)
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

//We need to support the following types of graphs:
// - Medical History
// - AddressBook (contacts)
// - Medications
// - Billing Report
//edges are always "strongly connected", however "source" nodes (roots, like Condition or Encounter -- depending on ) are only one way.
//add an edge from every resource to its related resource. Keep in mind that FHIR resources may not contain reciprocal edges, so we ensure the graph is rooted by flipping any
//related resources that are "Condition" or "Encounter"
func (sr *SqliteRepository) PopulateGraphTypeReciprocalRelationships(graphType pkg.ResourceGraphType, relationships []models.RelatedResource) []models.RelatedResource {
	reciprocalRelationships := []models.RelatedResource{}

	//prioritized lists of sources and sinks for the graph. We will use these to determine which resources are "root" nodes.
	sources, sinks, _ := getSourcesAndSinksForGraphType(graphType)

	for _, relationship := range relationships {

		//calculate the
		resourceAGraphSourceLevel := foundResourceGraphSource(relationship.ResourceFhirSourceResourceType, sources)
		resourceBGraphSourceLevel := foundResourceGraphSource(relationship.RelatedResourceFhirSourceResourceType, sources)

		resourceAGraphSinkLevel := foundResourceGraphSink(relationship.ResourceFhirSourceResourceType, sinks)
		resourceBGraphSinkLevel := foundResourceGraphSink(relationship.RelatedResourceFhirSourceResourceType, sinks)

		if resourceAGraphSourceLevel > -1 && resourceBGraphSourceLevel > -1 {
			//handle the case where both resources are "sources" (eg. MedicalHistory - Condition or Encounter)
			if resourceAGraphSourceLevel <= resourceBGraphSourceLevel {
				//A is a higher priority than B, so we will add an edge from A to B
				reciprocalRelationships = append(reciprocalRelationships, relationship)
			} else {
				//B is a higher priority than A, so we will add an edge from B to A (flipped relationship)
				reciprocalRelationships = append(reciprocalRelationships, models.RelatedResource{
					ResourceFhirUserID:                    relationship.RelatedResourceFhirUserID,
					ResourceFhirSourceID:                  relationship.RelatedResourceFhirSourceID,
					ResourceFhirSourceResourceType:        relationship.RelatedResourceFhirSourceResourceType,
					ResourceFhirSourceResourceID:          relationship.RelatedResourceFhirSourceResourceID,
					RelatedResourceFhirUserID:             relationship.ResourceFhirUserID,
					RelatedResourceFhirSourceID:           relationship.ResourceFhirSourceID,
					RelatedResourceFhirSourceResourceType: relationship.ResourceFhirSourceResourceType,
					RelatedResourceFhirSourceResourceID:   relationship.ResourceFhirSourceResourceID,
				})
			}

		} else if resourceAGraphSourceLevel > -1 || resourceBGraphSinkLevel > -1 {
			//resource A is a Source, or resource B is a sink, normal A -> B relationship (edge)
			reciprocalRelationships = append(reciprocalRelationships, relationship)

		} else if resourceBGraphSourceLevel > -1 || resourceAGraphSinkLevel > -1 {
			//resource B is a Source, or resource A is a sink, create B -> A relationship (edge)

			reciprocalRelationships = append(reciprocalRelationships, models.RelatedResource{
				ResourceFhirUserID:                    relationship.RelatedResourceFhirUserID,
				ResourceFhirSourceID:                  relationship.RelatedResourceFhirSourceID,
				ResourceFhirSourceResourceType:        relationship.RelatedResourceFhirSourceResourceType,
				ResourceFhirSourceResourceID:          relationship.RelatedResourceFhirSourceResourceID,
				RelatedResourceFhirUserID:             relationship.ResourceFhirUserID,
				RelatedResourceFhirSourceID:           relationship.ResourceFhirSourceID,
				RelatedResourceFhirSourceResourceType: relationship.ResourceFhirSourceResourceType,
				RelatedResourceFhirSourceResourceID:   relationship.ResourceFhirSourceResourceID,
			})

		} else {
			//this is a regular pair of resources, create reciprocal edges

			reciprocalRelationships = append(reciprocalRelationships, relationship)

			reciprocalRelationships = append(reciprocalRelationships, models.RelatedResource{
				ResourceFhirUserID:                    relationship.RelatedResourceFhirUserID,
				ResourceFhirSourceID:                  relationship.RelatedResourceFhirSourceID,
				ResourceFhirSourceResourceType:        relationship.RelatedResourceFhirSourceResourceType,
				ResourceFhirSourceResourceID:          relationship.RelatedResourceFhirSourceResourceID,
				RelatedResourceFhirUserID:             relationship.ResourceFhirUserID,
				RelatedResourceFhirSourceID:           relationship.ResourceFhirSourceID,
				RelatedResourceFhirSourceResourceType: relationship.ResourceFhirSourceResourceType,
				RelatedResourceFhirSourceResourceID:   relationship.ResourceFhirSourceResourceID,
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
			{"condition", "composition"},
			{"encounter", "explanationofbenefit"},
		}
		sinks = [][]string{
			{"location", "device", "organization", "practitioner", "medication", "patient", "coverage"}, //resources that are shared across multiple conditions
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

//source resource types are resources that are at the root of the graph, nothing may reference them directly
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

//sink resource types are the leaves of the graph, they must not reference anything else. (only be referenced)
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
func resourceVertexId(resource *models.ResourceBase) string {
	return resourceKeysVertexId(resource.SourceID.String(), resource.SourceResourceType, resource.SourceResourceID)
}
func resourceKeysVertexId(sourceId string, resourceType string, resourceId string) string {
	return strings.ToLower(fmt.Sprintf("%s/%s/%s", sourceId, resourceType, resourceId))
}
