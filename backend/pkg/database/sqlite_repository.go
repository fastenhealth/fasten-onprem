package database

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/dominikbraun/graph"
	sourceModel "github.com/fastenhealth/fasten-sources/clients/models"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"golang.org/x/exp/slices"
	"gorm.io/datatypes"
	"gorm.io/gorm"
	"net/url"
	"strings"
)

func NewRepository(appConfig config.Interface, globalLogger logrus.FieldLogger) (DatabaseRepository, error) {
	//backgroundContext := context.Background()

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Gorm/SQLite setup
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	globalLogger.Infof("Trying to connect to sqlite db: %s\n", appConfig.GetString("database.location"))

	// When a transaction cannot lock the database, because it is already locked by another one,
	// SQLite by default throws an error: database is locked. This behavior is usually not appropriate when
	// concurrent access is needed, typically when multiple processes write to the same database.
	// PRAGMA busy_timeout lets you set a timeout or a handler for these events. When setting a timeout,
	// SQLite will try the transaction multiple times within this timeout.
	// fixes #341
	// https://rsqlite.r-dbi.org/reference/sqlitesetbusyhandler
	// retrying for 30000 milliseconds, 30seconds - this would be unreasonable for a distributed multi-tenant application,
	// but should be fine for local usage.
	pragmaStr := sqlitePragmaString(map[string]string{
		"busy_timeout": "30000",
		"foreign_keys": "ON",
	})
	database, err := gorm.Open(sqlite.Open(appConfig.GetString("database.location")+pragmaStr), &gorm.Config{
		//TODO: figure out how to log database queries again.
		//Logger: Logger
		DisableForeignKeyConstraintWhenMigrating: true,
	})

	if strings.ToUpper(appConfig.GetString("log.level")) == "DEBUG" {
		database = database.Debug() //set debug globally
	}

	if err != nil {
		return nil, fmt.Errorf("Failed to connect to database! - %v", err)
	}
	globalLogger.Infof("Successfully connected to fasten sqlite db: %s\n", appConfig.GetString("database.location"))

	fastenRepo := SqliteRepository{
		AppConfig:  appConfig,
		Logger:     globalLogger,
		GormClient: database,
	}

	//TODO: automigrate for now
	err = fastenRepo.Migrate()
	if err != nil {
		return nil, err
	}

	// create/update admin user
	adminUser := models.User{}
	err = database.FirstOrCreate(&adminUser, models.User{Username: "admin"}).Error
	if err != nil {
		return nil, fmt.Errorf("Failed to create admin user! - %v", err)
	}

	return &fastenRepo, nil
}

type SqliteRepository struct {
	AppConfig config.Interface
	Logger    logrus.FieldLogger

	GormClient *gorm.DB
}

func (sr *SqliteRepository) Migrate() error {
	err := sr.GormClient.AutoMigrate(
		&models.User{},
		&models.SourceCredential{},
		&models.ResourceFhir{},
		&models.Glossary{},
	)
	if err != nil {
		return fmt.Errorf("Failed to automigrate! - %v", err)
	}
	return nil
}

func (sr *SqliteRepository) Close() error {
	return nil
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// User
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

func (sr *SqliteRepository) CreateUser(ctx context.Context, user *models.User) error {
	if err := user.HashPassword(user.Password); err != nil {
		return err
	}
	record := sr.GormClient.Create(user)
	if record.Error != nil {
		return record.Error
	}
	return nil
}
func (sr *SqliteRepository) GetUserByUsername(ctx context.Context, username string) (*models.User, error) {
	var foundUser models.User
	result := sr.GormClient.Where(models.User{Username: username}).First(&foundUser)
	return &foundUser, result.Error
}

//TODO: check for error, right now we return a nil which may cause a panic.
func (sr *SqliteRepository) GetCurrentUser(ctx context.Context) (*models.User, error) {
	username := ctx.Value(pkg.ContextKeyTypeAuthUsername)
	if username == nil {
		ginCtx := ctx.(*gin.Context)
		username = ginCtx.MustGet(pkg.ContextKeyTypeAuthUsername)
	}

	var currentUser models.User
	result := sr.GormClient.First(&currentUser, models.User{Username: username.(string)})

	if result.Error != nil {
		return nil, fmt.Errorf("could not retrieve current user: %v", result.Error)
	}

	return &currentUser, nil
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Glossary
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

func (sr *SqliteRepository) CreateGlossaryEntry(ctx context.Context, glossaryEntry *models.Glossary) error {
	record := sr.GormClient.Create(glossaryEntry)
	if record.Error != nil {
		return record.Error
	}
	return nil
}

func (sr *SqliteRepository) GetGlossaryEntry(ctx context.Context, code string, codeSystem string) (*models.Glossary, error) {
	var foundGlossaryEntry models.Glossary
	result := sr.GormClient.Where(models.Glossary{Code: code, CodeSystem: codeSystem}).First(&foundGlossaryEntry)
	return &foundGlossaryEntry, result.Error
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Summary
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

func (sr *SqliteRepository) GetSummary(ctx context.Context) (*models.Summary, error) {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	// we want a count of all resources for this user by type
	var resourceCountResults []map[string]interface{}

	//group by resource type and return counts
	// SELECT source_resource_type as resource_type, COUNT(*) as count FROM resource_fhirs WHERE source_id = "53c1e930-63af-46c9-b760-8e83cbc1abd9" GROUP BY source_resource_type;
	result := sr.GormClient.WithContext(ctx).
		Model(models.ResourceFhir{}).
		Select("source_resource_type as resource_type, count(*) as count").
		Group("source_resource_type").
		Where(models.OriginBase{
			UserID: currentUser.ID,
		}).
		Scan(&resourceCountResults)
	if result.Error != nil {
		return nil, result.Error
	}

	// we want a list of all sources (when they were last updated)
	sources, err := sr.GetSources(ctx)
	if err != nil {
		return nil, err
	}

	// we want the main Patient for each source
	patients, err := sr.GetPatientForSources(ctx)
	if err != nil {
		return nil, err
	}

	if resourceCountResults == nil {
		resourceCountResults = []map[string]interface{}{}
	}
	summary := &models.Summary{
		Sources:            sources,
		ResourceTypeCounts: resourceCountResults,
		Patients:           patients,
	}

	return summary, nil
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Resource
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

func (sr *SqliteRepository) UpsertRawResource(ctx context.Context, sourceCredential sourceModel.SourceCredential, rawResource sourceModel.RawResourceFhir) (bool, error) {

	source := sourceCredential.(models.SourceCredential)

	wrappedResourceModel := &models.ResourceFhir{
		OriginBase: models.OriginBase{
			ModelBase:          models.ModelBase{},
			UserID:             source.UserID,
			SourceID:           source.ID,
			SourceResourceID:   rawResource.SourceResourceID,
			SourceResourceType: rawResource.SourceResourceType,
		},
		SortTitle:           rawResource.SortTitle,
		SortDate:            rawResource.SortDate,
		ResourceRaw:         datatypes.JSON(rawResource.ResourceRaw),
		RelatedResourceFhir: nil,
	}

	//create associations
	//note: we create the association in the related_resources table **before** the model actually exists.

	if rawResource.ReferencedResources != nil && len(rawResource.ReferencedResources) > 0 {
		for _, referencedResource := range rawResource.ReferencedResources {
			parts := strings.Split(referencedResource, "/")
			if len(parts) != 2 {
				continue
			}

			relatedResource := &models.ResourceFhir{
				OriginBase: models.OriginBase{
					SourceID:           source.ID,
					SourceResourceType: parts[0],
					SourceResourceID:   parts[1],
				},
				RelatedResourceFhir: nil,
			}
			err := sr.AddReciprocalResourceAssociations(ctx, &source, wrappedResourceModel, &source, relatedResource)
			if err != nil {
				sr.Logger.Errorf("Error when creating a reciprocal association for %s: %v", referencedResource, err)
			}
		}
	}

	return sr.UpsertResource(ctx, wrappedResourceModel)

}

//this method will upsert a resource, however it will not create associations.
func (sr *SqliteRepository) UpsertResource(ctx context.Context, wrappedResourceModel *models.ResourceFhir) (bool, error) {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return false, currentUserErr
	}

	wrappedResourceModel.UserID = currentUser.ID
	wrappedResourceModel.RelatedResourceFhir = nil
	cachedResourceRaw := wrappedResourceModel.ResourceRaw

	sr.Logger.Infof("insert/update (%v) %v", wrappedResourceModel.SourceResourceType, wrappedResourceModel.SourceResourceID)

	createResult := sr.GormClient.WithContext(ctx).Where(models.OriginBase{
		SourceID:           wrappedResourceModel.GetSourceID(),
		SourceResourceID:   wrappedResourceModel.GetSourceResourceID(),
		SourceResourceType: wrappedResourceModel.GetSourceResourceType(), //TODO: and UpdatedAt > old UpdatedAt
	}).Omit("RelatedResourceFhir.*").FirstOrCreate(wrappedResourceModel)

	if createResult.Error != nil {
		return false, createResult.Error
	} else if createResult.RowsAffected == 0 {
		//at this point, wrappedResourceModel contains the data found in the database.
		// check if the database resource matches the new resource.
		if wrappedResourceModel.ResourceRaw.String() != string(cachedResourceRaw) {
			updateResult := createResult.Omit("RelatedResourceFhir.*").Updates(wrappedResourceModel)
			return updateResult.RowsAffected > 0, updateResult.Error
		} else {
			return false, nil
		}

	} else {
		//resource was created
		return createResult.RowsAffected > 0, createResult.Error
	}
}

func (sr *SqliteRepository) ListResources(ctx context.Context, queryOptions models.ListResourceQueryOptions) ([]models.ResourceFhir, error) {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	queryParam := models.ResourceFhir{
		OriginBase: models.OriginBase{
			UserID: currentUser.ID,
		},
	}

	if len(queryOptions.SourceResourceType) > 0 {
		queryParam.OriginBase.SourceResourceType = queryOptions.SourceResourceType
	}

	if len(queryOptions.SourceID) > 0 {
		sourceUUID, err := uuid.Parse(queryOptions.SourceID)
		if err != nil {
			return nil, err
		}

		queryParam.OriginBase.SourceID = sourceUUID
	}
	if len(queryOptions.SourceResourceID) > 0 {
		queryParam.OriginBase.SourceResourceID = queryOptions.SourceResourceID
	}

	manifestJson, _ := json.MarshalIndent(queryParam, "", "  ")
	sr.Logger.Infof("THE QUERY OBJECT===========> %v", string(manifestJson))

	var wrappedResourceModels []models.ResourceFhir
	queryBuilder := sr.GormClient.WithContext(ctx)
	if queryOptions.PreloadRelated {
		//enable preload functionality in query
		queryBuilder = queryBuilder.Preload("RelatedResourceFhir")
	}
	results := queryBuilder.Where(queryParam).
		Find(&wrappedResourceModels)

	return wrappedResourceModels, results.Error
}

func (sr *SqliteRepository) GetResourceBySourceType(ctx context.Context, sourceResourceType string, sourceResourceId string) (*models.ResourceFhir, error) {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	queryParam := models.ResourceFhir{
		OriginBase: models.OriginBase{
			UserID:             currentUser.ID,
			SourceResourceType: sourceResourceType,
			SourceResourceID:   sourceResourceId,
		},
	}

	var wrappedResourceModel models.ResourceFhir
	results := sr.GormClient.WithContext(ctx).
		Where(queryParam).
		First(&wrappedResourceModel)

	return &wrappedResourceModel, results.Error
}

func (sr *SqliteRepository) GetResourceBySourceId(ctx context.Context, sourceId string, sourceResourceId string) (*models.ResourceFhir, error) {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	sourceIdUUID, err := uuid.Parse(sourceId)
	if err != nil {
		return nil, err
	}

	queryParam := models.ResourceFhir{
		OriginBase: models.OriginBase{
			UserID:           currentUser.ID,
			SourceID:         sourceIdUUID,
			SourceResourceID: sourceResourceId,
		},
	}

	var wrappedResourceModel models.ResourceFhir
	results := sr.GormClient.WithContext(ctx).
		Where(queryParam).
		First(&wrappedResourceModel)

	return &wrappedResourceModel, results.Error
}

// Get the patient for each source (for the current user)
func (sr *SqliteRepository) GetPatientForSources(ctx context.Context) ([]models.ResourceFhir, error) {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	//SELECT * FROM resource_fhirs WHERE user_id = "" and source_resource_type = "Patient" GROUP BY source_id

	//var sourceCred models.SourceCredential
	//results := sr.GormClient.WithContext(ctx).
	//	Where(models.SourceCredential{UserID: sr.GetCurrentUser(ctx).ID, ModelBase: models.ModelBase{ID: sourceUUID}}).
	//	First(&sourceCred)

	var wrappedResourceModels []models.ResourceFhir
	results := sr.GormClient.WithContext(ctx).
		Model(models.ResourceFhir{}).
		//Group("source_id"). //broken in Postgres.
		Where(models.OriginBase{
			UserID:             currentUser.ID,
			SourceResourceType: "Patient",
		}).
		Find(&wrappedResourceModels)

	return wrappedResourceModels, results.Error
}

// Retrieve a list of all fhir resources (vertex), and a list of all associations (edge)
// Generate a graph
// return list of root nodes, and their flattened related resources.
func (sr *SqliteRepository) GetFlattenedResourceGraph(ctx context.Context) ([]*models.ResourceFhir, []*models.ResourceFhir, error) {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, nil, currentUserErr
	}

	// Get list of all resources
	wrappedResourceModels, err := sr.ListResources(ctx, models.ListResourceQueryOptions{})
	if err != nil {
		return nil, nil, err
	}

	// Get list of all relationships
	var relatedResourceRelationships []models.RelatedResource

	// SELECT * FROM related_resources WHERE user_id = "53c1e930-63af-46c9-b760-8e83cbc1abd9";
	result := sr.GormClient.WithContext(ctx).
		Table("related_resources").
		Where(models.RelatedResource{
			ResourceFhirUserID: currentUser.ID,
		}).
		Scan(&relatedResourceRelationships)
	if result.Error != nil {
		return nil, nil, result.Error
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
			return nil, nil, fmt.Errorf("an error occurred while adding vertex: %v", err)
		}
	}

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
		return nil, nil, fmt.Errorf("error while generating AdjacencyMap: %v", err)
	}

	// For a directed graph, PredecessorMap is the complement of AdjacencyMap. This is because in a directed graph, only
	// vertices joined by an outgoing edge are considered adjacent to the current vertex, whereas
	// predecessors are the vertices joined by an ingoing edge.
	// ie. "empty" verticies in this map are "root" nodes.
	predecessorMap, err := g.PredecessorMap()
	if err != nil {
		return nil, nil, fmt.Errorf("error while generating PredecessorMap: %v", err)
	}

	// Doing this in one massive function, because passing graph by reference is difficult due to generics.

	// Step 1: use predecessorMap to find all "root" encounters and conditions. store those nodes in their respective lists.
	encounterList := []*models.ResourceFhir{}
	conditionList := []*models.ResourceFhir{}
	for vertexId, val := range predecessorMap {

		if len(val) != 0 {
			//skip any nodes/verticies/resources that are not "root"
			continue
		}

		resource, err := g.Vertex(vertexId)
		if err != nil {
			//could not find this vertex in graph, ignoring
			continue
		}

		if strings.ToLower(resource.SourceResourceType) == "condition" || strings.ToLower(resource.SourceResourceType) == strings.ToLower(pkg.FhirResourceTypeComposition) {
			conditionList = append(conditionList, resource)
		} else if strings.ToLower(resource.SourceResourceType) == "encounter" {
			encounterList = append(encounterList, resource)
		}
	}

	// Step 2: define a function. When given a resource, should find all related resources, flatten the heirarchy and set the RelatedResourceFhir list
	flattenRelatedResourcesFn := func(resource *models.ResourceFhir) {
		// this is a "root" encounter, which is not related to any condition, we should add it to the Unknown encounters list
		vertexId := resourceVertexId(resource)
		sr.Logger.Debugf("populating resource: %s", vertexId)

		resource.RelatedResourceFhir = []*models.ResourceFhir{}

		//get all the resources associated with this node
		graph.DFS(g, vertexId, func(relatedVertexId string) bool {
			relatedResourceFhir, _ := g.Vertex(relatedVertexId)
			//skip the current resource if it's referenced in this list.
			//also skip the current resource if its a Binary resource (which is a special case)
			if vertexId != resourceVertexId(relatedResourceFhir) && relatedResourceFhir.SourceResourceType != "Binary" {
				resource.RelatedResourceFhir = append(resource.RelatedResourceFhir, relatedResourceFhir)
			}
			return false
		})
	}

	// Step 3: populate related resources for each encounter, flattened
	for ndx, _ := range encounterList {
		// this is a "root" encounter, which is not related to any condition, we should add it to the Unknown encounters list
		flattenRelatedResourcesFn(encounterList[ndx])

		//sort all related resources (by date, desc)
		encounterList[ndx].RelatedResourceFhir = utils.SortResourcePtrListByDate(encounterList[ndx].RelatedResourceFhir)

	}

	// Step 4: find all encounters referenced by the root conditions, populate them, then add them to the condition as RelatedResourceFhir
	for ndx, _ := range conditionList {
		// this is a "root" condition,

		conditionList[ndx].RelatedResourceFhir = []*models.ResourceFhir{}
		vertexId := resourceVertexId(conditionList[ndx])
		for relatedVertexId, _ := range adjacencyMap[vertexId] {
			relatedResourceFhir, _ := g.Vertex(relatedVertexId)
			flattenRelatedResourcesFn(relatedResourceFhir)
			conditionList[ndx].RelatedResourceFhir = append(conditionList[ndx].RelatedResourceFhir, relatedResourceFhir)
		}

		//sort all related resources (by date, desc)
		conditionList[ndx].RelatedResourceFhir = utils.SortResourcePtrListByDate(conditionList[ndx].RelatedResourceFhir)
	}

	conditionList = utils.SortResourcePtrListByDate(conditionList)
	encounterList = utils.SortResourcePtrListByDate(encounterList)
	return conditionList, encounterList, nil
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Resource Associations
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//edges are always "strongly connected", however "source" nodes (roots, like Condition or Encounter) are only one way.
//add an edge from every resource to its related resource. Keep in mind that FHIR resources may not contain reciprocal edges, so we ensure the graph is rooted by flipping any
//related resources that are "Condition" or "Encounter"
func (sr *SqliteRepository) AddReciprocalResourceAssociations(ctx context.Context, source *models.SourceCredential, resource *models.ResourceFhir, relatedSource *models.SourceCredential, relatedResource *models.ResourceFhir) error {
	//ensure that the sources are "owned" by the same user
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return currentUserErr
	}
	if source.UserID != relatedSource.UserID {
		return fmt.Errorf("user id's must match when adding associations")
	} else if source.UserID != currentUser.ID {
		return fmt.Errorf("user id's must match current user")
	}

	//manually create association(s) (we've tried to create using Association.Append, and it doesnt work for some reason.

	if isResourceGraphSource(resource) && isResourceGraphSource(relatedResource) {
		//handle the case where both resources are "sources" (Condition or Encounter)
		if strings.ToLower(resource.SourceResourceType) == "condition" {
			//condition is always the source
			if err := sr.AddResourceAssociation(
				ctx,
				source,
				resource.SourceResourceType,
				resource.SourceResourceID,
				source,
				relatedResource.SourceResourceType,
				relatedResource.SourceResourceID,
			); err != nil {
				//ignoring errors, could be due to duplicate edges
				sr.Logger.Warnf("an error occurred while creating resource association: %v", err)
			}
		} else {

			if err := sr.AddResourceAssociation(
				ctx,
				source,
				relatedResource.SourceResourceType,
				relatedResource.SourceResourceID,
				source,
				resource.SourceResourceType,
				resource.SourceResourceID,
			); err != nil {
				//ignoring errors, could be due to duplicate edges
				sr.Logger.Warnf("an error occurred while creating resource association: %v", err)
			}
		}

	} else if isResourceGraphSource(resource) || isResourceGraphSink(relatedResource) {
		//resource is a Source, or the relatedResource is a sink, create a "resource" => "relatedResource" edge

		if err := sr.AddResourceAssociation(
			ctx,
			source,
			resource.SourceResourceType,
			resource.SourceResourceID,
			source,
			relatedResource.SourceResourceType,
			relatedResource.SourceResourceID,
		); err != nil {
			//ignoring errors, could be due to duplicate edges
			sr.Logger.Warnf("an error occurred while creating resource association: %v", err)
		}

	} else if isResourceGraphSource(relatedResource) || isResourceGraphSink(resource) {
		//relatedResource is a Source, or the resource is a sink, create a "relatedResource" => "resource" edge

		if err := sr.AddResourceAssociation(
			ctx,
			source,
			relatedResource.SourceResourceType,
			relatedResource.SourceResourceID,
			source,
			resource.SourceResourceType,
			resource.SourceResourceID,
		); err != nil {
			//ignoring errors, could be due to duplicate edges
			sr.Logger.Warnf("an error occurred while creating resource association: %v", err)
		}

	} else {
		//this is a regular pair of resources, create reciprocal edges

		if err := sr.AddResourceAssociation(
			ctx,
			source,
			resource.SourceResourceType,
			resource.SourceResourceID,
			source,
			relatedResource.SourceResourceType,
			relatedResource.SourceResourceID,
		); err != nil {
			//ignoring errors, could be due to duplicate edges
			sr.Logger.Warnf("an error occurred while creating resource association: %v", err)
		}

		if err := sr.AddResourceAssociation(
			ctx,
			source,
			relatedResource.SourceResourceType,
			relatedResource.SourceResourceID,
			source,
			resource.SourceResourceType,
			resource.SourceResourceID,
		); err != nil {
			//ignoring errors, could be due to duplicate edges
			sr.Logger.Warnf("an error occurred while creating resource association: %v", err)
		}
	}
	return nil
}

func (sr *SqliteRepository) AddResourceAssociation(ctx context.Context, source *models.SourceCredential, resourceType string, resourceId string, relatedSource *models.SourceCredential, relatedResourceType string, relatedResourceId string) error {
	return sr.GormClient.WithContext(ctx).Table("related_resources").Create(map[string]interface{}{
		"resource_fhir_user_id":                      source.UserID,
		"resource_fhir_source_id":                    source.ID,
		"resource_fhir_source_resource_type":         resourceType,
		"resource_fhir_source_resource_id":           resourceId,
		"related_resource_fhir_user_id":              relatedSource.UserID,
		"related_resource_fhir_source_id":            relatedSource.ID,
		"related_resource_fhir_source_resource_type": relatedResourceType,
		"related_resource_fhir_source_resource_id":   relatedResourceId,
	}).Error
}

func (sr *SqliteRepository) RemoveResourceAssociation(ctx context.Context, source *models.SourceCredential, resourceType string, resourceId string, relatedSource *models.SourceCredential, relatedResourceType string, relatedResourceId string) error {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return currentUserErr
	}

	if source.UserID != relatedSource.UserID {
		return fmt.Errorf("user id's must match when adding associations")
	} else if source.UserID != currentUser.ID {
		return fmt.Errorf("user id's must match current user")
	}

	//manually create association (we've tried to create using Association.Append, and it doesnt work for some reason.
	return sr.GormClient.WithContext(ctx).Table("related_resources").Delete(map[string]interface{}{
		"resource_fhir_user_id":                      source.UserID,
		"resource_fhir_source_id":                    source.ID,
		"resource_fhir_source_resource_type":         resourceType,
		"resource_fhir_source_resource_id":           resourceId,
		"related_resource_fhir_user_id":              relatedSource.UserID,
		"related_resource_fhir_source_id":            relatedSource.ID,
		"related_resource_fhir_source_resource_type": relatedResourceType,
		"related_resource_fhir_source_resource_id":   relatedResourceId,
	}).Error
}

// AddResourceComposition
// this will group resources together into a "Composition" -- primarily to group related Encounters & Conditions into one semantic root.
// algorithm:
// - find source for each resource
// - (validate) ensure the current user and the source for each resource matches
// - check if there is a Composition resource Type already.
// 		- if Composition type already exists:
// 			- update "relatesTo" field with additional data.
// 		- else:
//			- Create a Composition resource type (populated with "relatesTo" references to all provided Resources)
// - add AddResourceAssociation for all resources linked to the Composition resource
// - store the Composition resource
func (sr *SqliteRepository) AddResourceComposition(ctx context.Context, compositionTitle string, resources []*models.ResourceFhir) error {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return currentUserErr
	}

	//generate placeholder source
	placeholderSource := models.SourceCredential{UserID: currentUser.ID, SourceType: "manual", ModelBase: models.ModelBase{ID: uuid.MustParse("00000000-0000-0000-0000-000000000000")}}

	existingCompositionResources := []*models.ResourceFhir{}
	rawResourceLookupTable := map[string]*models.ResourceFhir{}

	//find the source for each resource we'd like to merge. (for ownership verification)
	sourceLookup := map[uuid.UUID]*models.SourceCredential{}
	for _, resource := range resources {
		if resource.SourceResourceType == pkg.FhirResourceTypeComposition {
			//skip, Composition resources don't have a valid SourceCredential
			existingCompositionResources = append(existingCompositionResources, resource)

			//compositions may include existing resources, make sure we handle these
			for _, related := range resource.RelatedResourceFhir {
				rawResourceLookupTable[fmt.Sprintf("%s/%s", related.SourceResourceType, related.SourceResourceID)] = related
			}
			continue
		}

		if _, sourceOk := sourceLookup[resource.SourceID]; !sourceOk {
			//source has not been added yet, lets query for it.
			sourceCred, err := sr.GetSource(ctx, resource.SourceID.String())
			if err != nil {
				return fmt.Errorf("could not find source %s", resource.SourceID.String())
			}
			sourceLookup[resource.SourceID] = sourceCred
		}

		rawResourceLookupTable[fmt.Sprintf("%s/%s", resource.SourceResourceType, resource.SourceResourceID)] = resource
	}

	// (validate) ensure the current user and the source for each resource matches
	for _, source := range sourceLookup {
		if source.UserID != currentUser.ID {
			return fmt.Errorf("source must be owned by the current user: %s vs %s", source.UserID, currentUser.ID)
		}
	}

	// - check if there is a Composition resource Type already.
	var compositionResource *models.ResourceFhir

	if len(existingCompositionResources) > 0 {
		//- if Composition type already exists in this set
		//	- update "relatesTo" field with additional data.
		compositionResource = existingCompositionResources[0]

		//unassociated all existing composition resources.
		for _, existingCompositionResource := range existingCompositionResources[1:] {
			for _, relatedResource := range existingCompositionResource.RelatedResourceFhir {
				if err := sr.RemoveResourceAssociation(
					ctx,
					&placeholderSource,
					existingCompositionResource.SourceResourceType,
					existingCompositionResource.SourceResourceID,
					sourceLookup[relatedResource.SourceID],
					relatedResource.SourceResourceType,
					relatedResource.SourceResourceID,
				); err != nil {
					//ignoring errors, could be due to duplicate edges
					return fmt.Errorf("an error occurred while removing resource association: %v", err)
				}
			}

			//remove this resource
			err := sr.GormClient.WithContext(ctx).Delete(existingCompositionResource)
			if err.Error != nil {
				return fmt.Errorf("an error occurred while removing resource: %v", err)
			}
		}

	} else {
		//- else:
		//	- Create a Composition resource type (populated with "relatesTo" references to all provided Resources)
		compositionResource = &models.ResourceFhir{
			OriginBase: models.OriginBase{
				UserID:             placeholderSource.UserID, //
				SourceID:           placeholderSource.ID,     //Empty SourceID expected ("0000-0000-0000-0000")
				SourceResourceType: pkg.FhirResourceTypeComposition,
				SourceResourceID:   uuid.New().String(),
			},
		}
	}

	// - Generate an "updated" RawResource json blob
	rawCompositionResource := models.ResourceComposition{
		Title:     compositionTitle,
		RelatesTo: []models.ResourceCompositionRelatesTo{},
	}

	for relatedResourceKey, _ := range rawResourceLookupTable {
		rawCompositionResource.RelatesTo = append(rawCompositionResource.RelatesTo, models.ResourceCompositionRelatesTo{
			Target: models.ResourceCompositionRelatesToTarget{
				TargetReference: models.ResourceCompositionRelatesToTargetReference{
					Reference: relatedResourceKey,
				},
			},
		})
	}

	rawResourceJson, err := json.Marshal(rawCompositionResource)
	if err != nil {
		return err
	}
	compositionResource.ResourceRaw = rawResourceJson

	compositionResource.SortTitle = &compositionTitle
	compositionResource.RelatedResourceFhir = utils.SortResourcePtrListByDate(resources)
	compositionResource.SortDate = compositionResource.RelatedResourceFhir[0].SortDate

	//store the Composition resource
	_, err = sr.UpsertResource(ctx, compositionResource)
	if err != nil {
		return err
	}

	// - add AddResourceAssociation for all resources linked to the Composition resource
	for _, resource := range rawResourceLookupTable {
		if err := sr.AddResourceAssociation(
			ctx,
			&placeholderSource,
			compositionResource.SourceResourceType,
			compositionResource.SourceResourceID,
			sourceLookup[resource.SourceID],
			resource.SourceResourceType,
			resource.SourceResourceID,
		); err != nil {
			//ignoring errors, could be due to duplicate edges
			sr.Logger.Warnf("an error occurred while creating resource association: %v", err)
		}
	}

	return nil
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SourceCredential
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

func (sr *SqliteRepository) CreateSource(ctx context.Context, sourceCreds *models.SourceCredential) error {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return currentUserErr
	}
	sourceCreds.UserID = currentUser.ID

	//Assign will **always** update the source credential in the DB with data passed into this function.
	return sr.GormClient.WithContext(ctx).
		Where(models.SourceCredential{
			UserID:     sourceCreds.UserID,
			SourceType: sourceCreds.SourceType,
			Patient:    sourceCreds.Patient}).
		Assign(*sourceCreds).FirstOrCreate(sourceCreds).Error
}

func (sr *SqliteRepository) GetSource(ctx context.Context, sourceId string) (*models.SourceCredential, error) {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	sourceUUID, err := uuid.Parse(sourceId)
	if err != nil {
		return nil, err
	}

	var sourceCred models.SourceCredential
	results := sr.GormClient.WithContext(ctx).
		Where(models.SourceCredential{UserID: currentUser.ID, ModelBase: models.ModelBase{ID: sourceUUID}}).
		First(&sourceCred)

	return &sourceCred, results.Error
}

func (sr *SqliteRepository) GetSourceSummary(ctx context.Context, sourceId string) (*models.SourceSummary, error) {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	sourceUUID, err := uuid.Parse(sourceId)
	if err != nil {
		return nil, err
	}

	sourceSummary := &models.SourceSummary{}

	source, err := sr.GetSource(ctx, sourceId)
	if err != nil {
		return nil, err
	}
	sourceSummary.Source = source

	//group by resource type and return counts
	// SELECT source_resource_type as resource_type, COUNT(*) as count FROM resource_fhirs WHERE source_id = "53c1e930-63af-46c9-b760-8e83cbc1abd9" GROUP BY source_resource_type;

	var resourceTypeCounts []map[string]interface{}

	result := sr.GormClient.WithContext(ctx).
		Model(models.ResourceFhir{}).
		Select("source_id, source_resource_type as resource_type, count(*) as count").
		Group("source_resource_type").
		Where(models.OriginBase{
			UserID:   currentUser.ID,
			SourceID: sourceUUID,
		}).
		Scan(&resourceTypeCounts)

	if result.Error != nil {
		return nil, result.Error
	}

	sourceSummary.ResourceTypeCounts = resourceTypeCounts

	//set patient
	var wrappedPatientResourceModel models.ResourceFhir
	results := sr.GormClient.WithContext(ctx).
		Where(models.OriginBase{
			UserID:             currentUser.ID,
			SourceResourceType: "Patient",
			SourceID:           sourceUUID,
		}).
		First(&wrappedPatientResourceModel)

	if results.Error != nil {
		return nil, result.Error
	}
	sourceSummary.Patient = &wrappedPatientResourceModel

	return sourceSummary, nil
}

func (sr *SqliteRepository) GetSources(ctx context.Context) ([]models.SourceCredential, error) {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	var sourceCreds []models.SourceCredential
	results := sr.GormClient.WithContext(ctx).
		Where(models.SourceCredential{UserID: currentUser.ID}).
		Find(&sourceCreds)

	return sourceCreds, results.Error
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Utilities
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

func sqlitePragmaString(pragmas map[string]string) string {
	q := url.Values{}
	for key, val := range pragmas {
		q.Add("_pragma", key+"="+val)
	}

	queryStr := q.Encode()
	if len(queryStr) > 0 {
		return "?" + queryStr
	}
	return ""
}

//source resource types are resources that are at the root of the graph, nothing may reference them directly
func isResourceGraphSource(resource *models.ResourceFhir) bool {
	sourceResourceTypes := []string{"condition", "encounter"}
	return slices.Contains(sourceResourceTypes, strings.ToLower(resource.SourceResourceType)) // true
}

//sink resource types are the leaves of the graph, they must not reference anything else. (only be referenced)
func isResourceGraphSink(resource *models.ResourceFhir) bool {
	sinkResourceTypes := []string{"location", "binary", "device", "organization", "practitioner", "medication", "patient"}
	return slices.Contains(sinkResourceTypes, strings.ToLower(resource.SourceResourceType)) // true
}

// helper function for GetResourceGraph, creating a "hash" for the resource
func resourceVertexId(resource *models.ResourceFhir) string {
	return resourceKeysVertexId(resource.SourceID.String(), resource.SourceResourceType, resource.SourceResourceID)
}
func resourceKeysVertexId(sourceId string, resourceType string, resourceId string) string {
	return strings.ToLower(fmt.Sprintf("%s/%s/%s", sourceId, resourceType, resourceId))
}
