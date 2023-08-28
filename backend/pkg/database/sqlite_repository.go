package database

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	databaseModel "github.com/fastenhealth/fasten-onprem/backend/pkg/models/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/utils"
	sourceModel "github.com/fastenhealth/fasten-sources/clients/models"
	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
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

	//TODO: automigrate for now, this should be replaced with a migration tool once the DB has stabilized.
	err = fastenRepo.Migrate()
	if err != nil {
		return nil, err
	}

	//automigrate Fhir Resource Tables
	err = databaseModel.Migrate(fastenRepo.GormClient)
	if err != nil {
		return nil, err
	}

	// create/update admin user
	//TODO: determine if this admin user is ncessary
	//SECURITY: validate this user is necessary
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
		&models.Glossary{},
		&models.UserSettingEntry{},
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

	//create user settings
	err := sr.PopulateDefaultUserSettings(ctx, user.ID)
	if err != nil {
		return err
	}
	return nil
}
func (sr *SqliteRepository) GetUserByUsername(ctx context.Context, username string) (*models.User, error) {
	var foundUser models.User
	result := sr.GormClient.WithContext(ctx).Where(models.User{Username: username}).First(&foundUser)
	return &foundUser, result.Error
}

//TODO: check for error, right now we return a nil which may cause a panic.
func (sr *SqliteRepository) GetCurrentUser(ctx context.Context) (*models.User, error) {
	username := ctx.Value(pkg.ContextKeyTypeAuthUsername)
	if username == nil {
		ginCtx, ginCtxOk := ctx.(*gin.Context)
		if !ginCtxOk {
			return nil, fmt.Errorf("could not convert context to gin context")
		}
		var exists bool
		username, exists = ginCtx.Get(pkg.ContextKeyTypeAuthUsername)
		if !exists {
			return nil, fmt.Errorf("could not extract username from context")
		}
	}

	var currentUser models.User
	usernameStr, usernameStrOk := username.(string)
	if !usernameStrOk {
		return nil, fmt.Errorf("could not convert username to string: %v", username)
	}

	result := sr.GormClient.
		WithContext(ctx).
		First(&currentUser, map[string]interface{}{"username": usernameStr})

	if result.Error != nil {
		return nil, fmt.Errorf("could not retrieve current user: %v", result.Error)
	}

	return &currentUser, nil
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Glossary
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

func (sr *SqliteRepository) CreateGlossaryEntry(ctx context.Context, glossaryEntry *models.Glossary) error {
	record := sr.GormClient.WithContext(ctx).Create(glossaryEntry)
	if record.Error != nil {
		return record.Error
	}
	return nil
}

func (sr *SqliteRepository) GetGlossaryEntry(ctx context.Context, code string, codeSystem string) (*models.Glossary, error) {
	var foundGlossaryEntry models.Glossary
	result := sr.GormClient.WithContext(ctx).
		Where(models.Glossary{Code: code, CodeSystem: codeSystem}).
		First(&foundGlossaryEntry)
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

	resourceTypes := databaseModel.GetAllowedResourceTypes()
	for _, resourceType := range resourceTypes {
		tableName, err := databaseModel.GetTableNameByResourceType(resourceType)
		if err != nil {
			return nil, err
		}
		var count int64
		result := sr.GormClient.WithContext(ctx).
			Table(tableName).
			Where(models.OriginBase{
				UserID: currentUser.ID,
			}).
			Count(&count)
		if result.Error != nil {
			return nil, result.Error
		}
		if count == 0 {
			continue //don't add resource counts if the count is 0
		}
		resourceCountResults = append(resourceCountResults, map[string]interface{}{
			"resource_type": resourceType,
			"count":         count,
		})
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

//This function will create a new resource if it does not exist, or update an existing resource if it does exist.
//It will also create associations between fhir resources
//This function is called directly by fasten-sources
func (sr *SqliteRepository) UpsertRawResource(ctx context.Context, sourceCredential sourceModel.SourceCredential, rawResource sourceModel.RawResourceFhir) (bool, error) {

	source := sourceCredential.(*models.SourceCredential)

	//convert from a raw resource (from fasten-sources) to a ResourceFhir (which matches the database models)
	wrappedResourceModel := &models.ResourceBase{
		OriginBase: models.OriginBase{
			ModelBase:          models.ModelBase{},
			UserID:             source.UserID,
			SourceID:           source.ID,
			SourceResourceID:   rawResource.SourceResourceID,
			SourceResourceType: rawResource.SourceResourceType,
		},
		SortTitle:       rawResource.SortTitle,
		SortDate:        rawResource.SortDate,
		ResourceRaw:     datatypes.JSON(rawResource.ResourceRaw),
		RelatedResource: nil,
	}
	if len(rawResource.SourceUri) > 0 {
		wrappedResourceModel.SourceUri = &rawResource.SourceUri
	}

	//create associations
	//note: we create the association in the related_resources table **before** the model actually exists.
	//note: these associations are not reciprocal, (i.e. if Procedure references Location, Location may not reference Procedure)
	if rawResource.ReferencedResources != nil && len(rawResource.ReferencedResources) > 0 {
		for _, referencedResource := range rawResource.ReferencedResources {
			parts := strings.Split(referencedResource, "/")
			if len(parts) != 2 {
				continue
			}

			relatedResource := &models.ResourceBase{
				OriginBase: models.OriginBase{
					SourceID:           source.ID,
					SourceResourceType: parts[0],
					SourceResourceID:   parts[1],
				},
				RelatedResource: nil,
			}
			err := sr.AddResourceAssociation(
				ctx,
				source,
				wrappedResourceModel.SourceResourceType,
				wrappedResourceModel.SourceResourceID,
				source,
				relatedResource.SourceResourceType,
				relatedResource.SourceResourceID,
			)
			if err != nil {
				return false, err
			}
		}
	}

	return sr.UpsertResource(ctx, wrappedResourceModel)

}

// UpsertResource
// this method will upsert a resource, however it will not create associations.
// UPSERT operation
// - call FindOrCreate
// 	- check if the resource exists
// 	- if it does not exist, insert it
// - if no error during FindOrCreate && no rows affected (nothing was created)
// 	- update the resource using Updates operation
func (sr *SqliteRepository) UpsertResource(ctx context.Context, wrappedResourceModel *models.ResourceBase) (bool, error) {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return false, currentUserErr
	}

	wrappedResourceModel.UserID = currentUser.ID
	cachedResourceRaw := wrappedResourceModel.ResourceRaw

	sr.Logger.Infof("insert/update FHIRResource (%v) %v", wrappedResourceModel.SourceResourceType, wrappedResourceModel.SourceResourceID)
	wrappedFhirResourceModel, err := databaseModel.NewFhirResourceModelByType(wrappedResourceModel.SourceResourceType)
	if err != nil {
		return false, err
	}

	wrappedFhirResourceModel.SetOriginBase(wrappedResourceModel.OriginBase)
	wrappedFhirResourceModel.SetSortTitle(wrappedResourceModel.SortTitle)
	wrappedFhirResourceModel.SetSortDate(wrappedResourceModel.SortDate)
	wrappedFhirResourceModel.SetSourceUri(wrappedResourceModel.SourceUri)

	//TODO: this takes too long, we need to find a way to do this processing faster or in the background async.
	err = wrappedFhirResourceModel.PopulateAndExtractSearchParameters(json.RawMessage(wrappedResourceModel.ResourceRaw))
	if err != nil {
		sr.Logger.Warnf("ignoring: an error occurred while extracting SearchParameters using FHIRPath (%s/%s): %v", wrappedResourceModel.SourceResourceType, wrappedResourceModel.SourceResourceID, err)
		//wrappedFhirResourceModel.SetResourceRaw(wrappedResourceModel.ResourceRaw)
	}

	createResult := sr.GormClient.WithContext(ctx).Where(models.OriginBase{
		SourceID:           wrappedFhirResourceModel.GetSourceID(),
		SourceResourceID:   wrappedFhirResourceModel.GetSourceResourceID(),
		SourceResourceType: wrappedFhirResourceModel.GetSourceResourceType(), //TODO: and UpdatedAt > old UpdatedAt
	}).Omit("RelatedResource.*").FirstOrCreate(wrappedFhirResourceModel)

	if createResult.Error != nil {
		return false, createResult.Error
	} else if createResult.RowsAffected == 0 {
		//at this point, wrappedResourceModel contains the data found in the database.
		// check if the database resource matches the new resource.
		if wrappedResourceModel.ResourceRaw.String() != string(cachedResourceRaw) {
			updateResult := createResult.Omit("RelatedResource.*").Updates(wrappedResourceModel)
			return updateResult.RowsAffected > 0, updateResult.Error
		} else {
			return false, nil
		}

	} else {
		//resource was created
		return createResult.RowsAffected > 0, createResult.Error
	}
}

func (sr *SqliteRepository) ListResources(ctx context.Context, queryOptions models.ListResourceQueryOptions) ([]models.ResourceBase, error) {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	queryParam := models.OriginBase{
		UserID: currentUser.ID,
	}

	if len(queryOptions.SourceResourceType) > 0 {
		queryParam.SourceResourceType = queryOptions.SourceResourceType
	}

	if len(queryOptions.SourceID) > 0 {
		sourceUUID, err := uuid.Parse(queryOptions.SourceID)
		if err != nil {
			return nil, err
		}

		queryParam.SourceID = sourceUUID
	}
	if len(queryOptions.SourceResourceID) > 0 {
		queryParam.SourceResourceID = queryOptions.SourceResourceID
	}

	manifestJson, _ := json.MarshalIndent(queryParam, "", "  ")
	sr.Logger.Debugf("THE QUERY OBJECT===========> %v", string(manifestJson))

	var wrappedResourceModels []models.ResourceBase
	queryBuilder := sr.GormClient.WithContext(ctx)
	if len(queryOptions.SourceResourceType) > 0 {
		tableName, err := databaseModel.GetTableNameByResourceType(queryOptions.SourceResourceType)
		if err != nil {
			return nil, err
		}
		queryBuilder = queryBuilder.
			Where(queryParam).
			Table(tableName)

		if queryOptions.Limit > 0 {
			queryBuilder = queryBuilder.Limit(queryOptions.Limit).Offset(queryOptions.Offset)
		}
		return wrappedResourceModels, queryBuilder.Find(&wrappedResourceModels).Error
	} else {
		if queryOptions.Limit > 0 {
			queryBuilder = queryBuilder.Limit(queryOptions.Limit).Offset(queryOptions.Offset)
		}
		//there is no FHIR Resource name specified, so we're querying across all FHIR resources
		return sr.getResourcesFromAllTables(queryBuilder, queryParam)
	}
}

func (sr *SqliteRepository) GetResourceByResourceTypeAndId(ctx context.Context, sourceResourceType string, sourceResourceId string) (*models.ResourceBase, error) {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	tableName, err := databaseModel.GetTableNameByResourceType(sourceResourceType)
	if err != nil {
		return nil, err
	}

	queryParam := models.OriginBase{
		UserID:             currentUser.ID,
		SourceResourceType: sourceResourceType,
		SourceResourceID:   sourceResourceId,
	}

	var wrappedResourceModel models.ResourceBase
	results := sr.GormClient.WithContext(ctx).
		Where(queryParam).
		Table(tableName).
		First(&wrappedResourceModel)

	return &wrappedResourceModel, results.Error
}

// we need to figure out how to get the source resource type from the source resource id, or if we're searching across every table :(
func (sr *SqliteRepository) GetResourceBySourceId(ctx context.Context, sourceId string, sourceResourceId string) (*models.ResourceBase, error) {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	sourceIdUUID, err := uuid.Parse(sourceId)
	if err != nil {
		return nil, err
	}

	queryParam := models.OriginBase{
		UserID:           currentUser.ID,
		SourceID:         sourceIdUUID,
		SourceResourceID: sourceResourceId,
	}

	//there is no FHIR Resource name specified, so we're querying across all FHIR resources
	wrappedResourceModels, err := sr.getResourcesFromAllTables(sr.GormClient.WithContext(ctx), queryParam)
	if len(wrappedResourceModels) > 0 {
		return &wrappedResourceModels[0], err
	} else {
		return nil, fmt.Errorf("no resource found with source id %s and source resource id %s", sourceId, sourceResourceId)
	}
}

// Get the patient for each source (for the current user)
func (sr *SqliteRepository) GetPatientForSources(ctx context.Context) ([]models.ResourceBase, error) {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	//SELECT * FROM resource_bases WHERE user_id = "" and source_resource_type = "Patient" GROUP BY source_id

	tableName, err := databaseModel.GetTableNameByResourceType("Patient")
	if err != nil {
		return nil, err
	}

	var wrappedResourceModels []models.ResourceBase
	results := sr.GormClient.WithContext(ctx).
		//Group("source_id"). //broken in Postgres.
		Where(models.OriginBase{
			UserID:             currentUser.ID,
			SourceResourceType: "Patient",
		}).
		Table(tableName).
		Find(&wrappedResourceModels)

	return wrappedResourceModels, results.Error
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Resource Associations
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// verifyAssociationPermission ensure that the sources are "owned" by the same user, and that the user is the current user
func (sr *SqliteRepository) verifyAssociationPermission(ctx context.Context, sourceUserID uuid.UUID, relatedSourceUserID uuid.UUID) error {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return currentUserErr
	}
	if sourceUserID != relatedSourceUserID {
		return fmt.Errorf("user id's must match when adding associations")
	} else if sourceUserID != currentUser.ID {
		return fmt.Errorf("user id's must match current user")
	}

	return nil
}

func (sr *SqliteRepository) AddResourceAssociation(ctx context.Context, source *models.SourceCredential, resourceType string, resourceId string, relatedSource *models.SourceCredential, relatedResourceType string, relatedResourceId string) error {
	//ensure that the sources are "owned" by the same user
	err := sr.verifyAssociationPermission(ctx, source.UserID, relatedSource.UserID)
	if err != nil {
		return err
	}

	err = sr.GormClient.WithContext(ctx).Table("related_resources").Create(map[string]interface{}{
		"resource_base_user_id":                 source.UserID,
		"resource_base_source_id":               source.ID,
		"resource_base_source_resource_type":    resourceType,
		"resource_base_source_resource_id":      resourceId,
		"related_resource_user_id":              relatedSource.UserID,
		"related_resource_source_id":            relatedSource.ID,
		"related_resource_source_resource_type": relatedResourceType,
		"related_resource_source_resource_id":   relatedResourceId,
	}).Error
	uniqueConstraintError := errors.New("constraint failed: UNIQUE constraint failed")
	if err != nil {
		if strings.HasPrefix(err.Error(), uniqueConstraintError.Error()) {
			sr.Logger.Warnf("Ignoring an error when creating a related_resource association for %s/%s: %v", resourceType, resourceId, err)
			//we can safely ignore this error
			return nil
		}
	}
	return err
}

func (sr *SqliteRepository) RemoveResourceAssociation(ctx context.Context, source *models.SourceCredential, resourceType string, resourceId string, relatedSource *models.SourceCredential, relatedResourceType string, relatedResourceId string) error {
	//ensure that the sources are "owned" by the same user
	err := sr.verifyAssociationPermission(ctx, source.UserID, relatedSource.UserID)
	if err != nil {
		return err
	}

	//manually delete association
	results := sr.GormClient.WithContext(ctx).
		//Table("related_resources").
		Delete(&models.RelatedResource{}, map[string]interface{}{
			"resource_base_user_id":                 source.UserID,
			"resource_base_source_id":               source.ID,
			"resource_base_source_resource_type":    resourceType,
			"resource_base_source_resource_id":      resourceId,
			"related_resource_user_id":              relatedSource.UserID,
			"related_resource_source_id":            relatedSource.ID,
			"related_resource_source_resource_type": relatedResourceType,
			"related_resource_source_resource_id":   relatedResourceId,
		})

	if results.Error != nil {
		return results.Error
	} else if results.RowsAffected == 0 {
		return fmt.Errorf("no association found for %s/%s and %s/%s", resourceType, resourceId, relatedResourceType, relatedResourceId)
	}
	return nil
}

func (sr *SqliteRepository) FindResourceAssociationsByTypeAndId(ctx context.Context, source *models.SourceCredential, resourceType string, resourceId string) ([]models.RelatedResource, error) {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	if source.UserID != currentUser.ID {
		return nil, fmt.Errorf("source credential must match the current user id")
	}

	// SELECT * FROM related_resources WHERE user_id = "53c1e930-63af-46c9-b760-8e83cbc1abd9";
	var relatedResources []models.RelatedResource
	result := sr.GormClient.WithContext(ctx).
		Where(models.RelatedResource{
			ResourceBaseUserID:             currentUser.ID,
			ResourceBaseSourceID:           source.ID,
			ResourceBaseSourceResourceType: resourceType,
			ResourceBaseSourceResourceID:   resourceId,
		}).
		Find(&relatedResources)
	return relatedResources, result.Error
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Resource Composition (Grouping)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// AddResourceComposition
// this will group resources together into a "Composition" -- primarily to group related Encounters & Conditions into one semantic root.
// algorithm:
// - find source for each resource
// - (SECURITY) ensure the current user and the source for each resource matches
// - check if there is a Composition resource Type already.
// 		- if Composition type already exists:
// 			- update "relatesTo" field with additional data.
// 		- else:
//			- Create a Composition resource type (populated with "relatesTo" references to all provided Resources)
// - add AddResourceAssociation for all resources linked to the Composition resource
// - store the Composition resource
//TODO: determine if we should be using a List Resource instead of a Composition resource
func (sr *SqliteRepository) AddResourceComposition(ctx context.Context, compositionTitle string, resources []*models.ResourceBase) error {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return currentUserErr
	}

	//generate placeholder source
	placeholderSource := models.SourceCredential{UserID: currentUser.ID, SourceType: "manual", ModelBase: models.ModelBase{ID: uuid.MustParse("00000000-0000-0000-0000-000000000000")}}

	existingCompositionResources := []*models.ResourceBase{}
	rawResourceLookupTable := map[string]*models.ResourceBase{}

	//find the source for each resource we'd like to merge. (for ownership verification)
	sourceLookup := map[uuid.UUID]*models.SourceCredential{}
	for _, resource := range resources {
		if resource.SourceResourceType == pkg.FhirResourceTypeComposition {
			//skip, Composition resources don't have a valid SourceCredential
			existingCompositionResources = append(existingCompositionResources, resource)

			//compositions may include existing resources, make sure we handle these
			for _, related := range resource.RelatedResource {
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

	// SECURITY: ensure the current user and the source for each resource matches
	for _, source := range sourceLookup {
		if source.UserID != currentUser.ID {
			return fmt.Errorf("source must be owned by the current user: %s vs %s", source.UserID, currentUser.ID)
		}
	}

	// - check if there is a Composition resource Type already.
	var compositionResource *models.ResourceBase

	if len(existingCompositionResources) > 0 {
		//- if Composition type already exists in this set
		//	- update "relatesTo" field with additional data.
		compositionResource = existingCompositionResources[0]

		//disassociate all existing remaining composition resources.
		for _, existingCompositionResource := range existingCompositionResources[1:] {
			for _, relatedResource := range existingCompositionResource.RelatedResource {
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
			compositionTable, err := databaseModel.GetTableNameByResourceType("Composition")
			if err != nil {
				return fmt.Errorf("an error occurred while finding Composition resource table: %v", err)
			}
			//TODO: we may need to delete with using the FhirComposition struct type
			deleteResult := sr.GormClient.WithContext(ctx).
				Table(compositionTable).
				Delete(existingCompositionResource)
			if deleteResult.Error != nil {
				return fmt.Errorf("an error occurred while removing Composition resource(%s/%s): %v", existingCompositionResource.SourceResourceType, existingCompositionResource.SourceID, err)
			} else if deleteResult.RowsAffected != 1 {
				return fmt.Errorf("composition resource was not deleted %s/%s", existingCompositionResource.SourceResourceType, existingCompositionResource.SourceID)
			}
		}

	} else {
		//- else:
		//	- Create a Composition resource type (populated with "relatesTo" references to all provided Resources)
		compositionResource = &models.ResourceBase{
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
	compositionResource.RelatedResource = utils.SortResourcePtrListByDate(resources)
	compositionResource.SortDate = compositionResource.RelatedResource[0].SortDate

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
			return err
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

func (sr *SqliteRepository) UpdateSource(ctx context.Context, sourceCreds *models.SourceCredential) error {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return currentUserErr
	}
	sourceCreds.UserID = currentUser.ID

	//Assign will **always** update the source credential in the DB with data passed into this function.
	return sr.GormClient.WithContext(ctx).
		Where(models.SourceCredential{
			ModelBase:  models.ModelBase{ID: sourceCreds.ID},
			UserID:     sourceCreds.UserID,
			SourceType: sourceCreds.SourceType,
		}).Updates(models.SourceCredential{
		AccessToken:                   sourceCreds.AccessToken,
		RefreshToken:                  sourceCreds.RefreshToken,
		ExpiresAt:                     sourceCreds.ExpiresAt,
		DynamicClientId:               sourceCreds.DynamicClientId,
		DynamicClientRegistrationMode: sourceCreds.DynamicClientRegistrationMode,
		DynamicClientJWKS:             sourceCreds.DynamicClientJWKS,
	}).Error
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
	// SELECT source_resource_type as resource_type, COUNT(*) as count FROM resource_bases WHERE source_id = "53c1e930-63af-46c9-b760-8e83cbc1abd9" GROUP BY source_resource_type;

	var resourceTypeCounts []map[string]interface{}

	resourceTypes := databaseModel.GetAllowedResourceTypes()
	for _, resourceType := range resourceTypes {
		tableName, err := databaseModel.GetTableNameByResourceType(resourceType)
		if err != nil {
			return nil, err
		}
		var count int64
		result := sr.GormClient.WithContext(ctx).
			Table(tableName).
			Where(models.OriginBase{
				UserID:   currentUser.ID,
				SourceID: sourceUUID,
			}).
			Count(&count)
		if result.Error != nil {
			return nil, result.Error
		}
		if count == 0 {
			continue //don't add resource counts if the count is 0
		}
		resourceTypeCounts = append(resourceTypeCounts, map[string]interface{}{
			"source_id":     sourceId,
			"resource_type": resourceType,
			"count":         count,
		})
	}

	sourceSummary.ResourceTypeCounts = resourceTypeCounts

	//set patient
	patientTableName, err := databaseModel.GetTableNameByResourceType("Patient")
	if err != nil {
		return nil, err
	}
	var wrappedPatientResourceModel models.ResourceBase
	patientResults := sr.GormClient.WithContext(ctx).
		Where(models.OriginBase{
			UserID:             currentUser.ID,
			SourceResourceType: "Patient",
			SourceID:           sourceUUID,
		}).
		Table(patientTableName).
		First(&wrappedPatientResourceModel)

	if patientResults.Error != nil {
		return nil, patientResults.Error
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

//Internal function
// This function will return a list of resources from all FHIR tables in the database
// The query allows us to set the  source id, source resource id, source resource type
//SECURITY: this function assumes the user has already been authenticated
//TODO: theres probably a more efficient way of doing this with GORM
func (sr *SqliteRepository) getResourcesFromAllTables(queryBuilder *gorm.DB, queryParam models.OriginBase) ([]models.ResourceBase, error) {
	wrappedResourceModels := []models.ResourceBase{}
	resourceTypes := databaseModel.GetAllowedResourceTypes()
	for _, resourceType := range resourceTypes {
		tableName, err := databaseModel.GetTableNameByResourceType(resourceType)
		if err != nil {
			return nil, err
		}
		var tempWrappedResourceModels []models.ResourceBase
		results := queryBuilder.
			Where(queryParam).
			Table(tableName).
			Find(&tempWrappedResourceModels)
		if results.Error != nil {
			return nil, results.Error
		}
		wrappedResourceModels = append(wrappedResourceModels, tempWrappedResourceModels...)
	}
	return wrappedResourceModels, nil
}
