package database

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	sourcePkg "github.com/fastenhealth/fasten-sources/pkg"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	databaseModel "github.com/fastenhealth/fasten-onprem/backend/pkg/models/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/utils"
	sourceModel "github.com/fastenhealth/fasten-sources/clients/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type GormRepository struct {
	AppConfig config.Interface
	Logger    logrus.FieldLogger

	GormClient *gorm.DB

	EventBus event_bus.Interface
}

func (gr *GormRepository) Close() error {
	return nil
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// User
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// <editor-fold desc="User">
func (gr *GormRepository) CreateUser(ctx context.Context, user *models.User) error {
	if err := user.HashPassword(user.Password); err != nil {
		return err
	}
	record := gr.GormClient.Create(user)
	if record.Error != nil {
		return record.Error
	}

	//SECURITY:
	//TODO: we should disallow reserved usernames:
	// https://github.com/forwardemail/reserved-email-addresses-list/blob/master/admin-list.json
	// https://github.com/shouldbee/reserved-usernames/blob/master/reserved-usernames.txt

	//create user settings
	err := gr.PopulateDefaultUserSettings(ctx, user.ID)
	if err != nil {
		return err
	}

	//create Fasten source credential for this user.
	fastenUserCred := models.SourceCredential{
		UserID:       user.ID,
		PlatformType: sourcePkg.PlatformTypeFasten,
	}
	fastenUserCredResp := gr.GormClient.Create(&fastenUserCred)
	if fastenUserCredResp.Error != nil {
		return fastenUserCredResp.Error
	}

	return nil
}

func (gr *GormRepository) GetUserCount(ctx context.Context) (int, error) {
	var count int64
	result := gr.GormClient.WithContext(ctx).Model(&models.User{}).Count(&count)
	return int(count), result.Error
}

func (gr *GormRepository) GetUserByUsername(ctx context.Context, username string) (*models.User, error) {
	var foundUser models.User
	result := gr.GormClient.WithContext(ctx).Where(models.User{Username: username}).First(&foundUser)
	return &foundUser, result.Error
}

// TODO: check for error, right now we return a nil which may cause a panic.
// TODO: can we cache the current user? //SECURITY:
func (gr *GormRepository) GetCurrentUser(ctx context.Context) (*models.User, error) {
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

	result := gr.GormClient.
		WithContext(ctx).
		First(&currentUser, map[string]interface{}{"username": usernameStr})

	if result.Error != nil {
		return nil, fmt.Errorf("could not retrieve current user: %v", result.Error)
	}

	return &currentUser, nil
}

// SECURITY: this should only be called after the user has confirmed they want to delete their account.
func (gr *GormRepository) DeleteCurrentUser(ctx context.Context) error {
	currentUser, err := gr.GetCurrentUser(ctx)
	if err != nil {
		return err
	}

	//delete all records associated with this user.
	// - background jobs
	// - FHIR Resources
	// - source credentials
	// - related resources
	// - user settings
	// - user

	//delete background jobs
	err = gr.GormClient.
		Where(models.BackgroundJob{UserID: currentUser.ID}).
		Delete(&models.BackgroundJob{}).Error
	if err != nil {
		return fmt.Errorf("could not delete background jobs for user: %w", err)
	}

	//delete FHIR Resources & sources
	sources, err := gr.GetSources(ctx)
	if err != nil {
		return fmt.Errorf("could not get sources: %w", err)
	}
	for _, source := range sources {
		_, err = gr.DeleteSource(ctx, source.ID.String())
		if err != nil {
			return fmt.Errorf("could not delete source (%s) & resources for user: %w", source.ID.String(), err)
		}
	}

	//delete related resources
	err = gr.GormClient.
		Where(models.RelatedResource{ResourceBaseUserID: currentUser.ID}).
		Delete(&models.RelatedResource{}).Error
	if err != nil {
		return fmt.Errorf("could not delete related resources for user: %w", err)
	}

	//delete user settings
	err = gr.GormClient.
		Where(models.UserSettingEntry{UserID: currentUser.ID}).
		Delete(&models.UserSettingEntry{}).Error
	if err != nil {
		return fmt.Errorf("could not delete user settings for user: %w", err)
	}
	//delete user
	err = gr.GormClient.
		Where(models.User{ModelBase: models.ModelBase{ID: currentUser.ID}}).
		Delete(&models.User{}).Error
	if err != nil {
		return fmt.Errorf("could not delete user: %w", err)
	}
	return nil
}

func (gr *GormRepository) GetUsers(ctx context.Context) ([]models.User, error) {
	var users []models.User
	result := gr.GormClient.WithContext(ctx).Find(&users)
	// Remove password field from each user
	var sanitizedUsers []models.User
	for _, user := range users {
		user.Password = "" // Clear the password field
		sanitizedUsers = append(sanitizedUsers, user)
	}
	return sanitizedUsers, result.Error
}

//</editor-fold>

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Glossary
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// <editor-fold desc="Glossary">
func (gr *GormRepository) CreateGlossaryEntry(ctx context.Context, glossaryEntry *models.Glossary) error {
	record := gr.GormClient.WithContext(ctx).Create(glossaryEntry)
	if record.Error != nil {
		return record.Error
	}
	return nil
}

func (gr *GormRepository) GetGlossaryEntry(ctx context.Context, code string, codeSystem string) (*models.Glossary, error) {
	var foundGlossaryEntry models.Glossary
	result := gr.GormClient.WithContext(ctx).
		Where(models.Glossary{Code: code, CodeSystem: codeSystem}).
		First(&foundGlossaryEntry)
	return &foundGlossaryEntry, result.Error
}

//</editor-fold>

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Summary
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

func (gr *GormRepository) GetSummary(ctx context.Context) (*models.Summary, error) {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
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
		result := gr.GormClient.WithContext(ctx).
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
	sources, err := gr.GetSources(ctx)
	if err != nil {
		return nil, err
	}

	// we want the main Patient for each source
	patients, err := gr.GetPatientForSources(ctx)
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

// <editor-fold desc="Resource">

// This function will create a new resource if it does not exist, or update an existing resource if it does exist.
// It will also create associations between fhir resources
// This function is called directly by fasten-sources
func (gr *GormRepository) UpsertRawResource(ctx context.Context, sourceCredential sourceModel.SourceCredential, rawResource sourceModel.RawResourceFhir) (bool, error) {

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

			var relatedResource *models.ResourceBase

			if strings.HasPrefix(referencedResource, sourcePkg.FASTENHEALTH_URN_PREFIX) {
				gr.Logger.Infof("parsing external urn:fastenhealth-fhir reference: %v", referencedResource)

				targetSourceId, targetResourceType, targetResourceId, err := sourcePkg.ParseReferenceUri(&referencedResource)
				if err != nil {
					gr.Logger.Warnf("could not parse urn:fastenhealth-fhir reference: %v", referencedResource)
					continue
				}
				err = gr.UpsertRawResourceAssociation(
					ctx,
					source.ID.String(),
					wrappedResourceModel.SourceResourceType,
					wrappedResourceModel.SourceResourceID,
					targetSourceId,
					targetResourceType,
					targetResourceId,
				)
				if err != nil {
					return false, err
				}
			} else {
				parts := strings.Split(referencedResource, "/")
				if len(parts) != 2 {
					continue
				}
				relatedResource = &models.ResourceBase{
					OriginBase: models.OriginBase{
						SourceID:           source.ID,
						SourceResourceType: parts[0],
						SourceResourceID:   parts[1],
					},
					RelatedResource: nil,
				}
				err := gr.AddResourceAssociation(
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
	}

	return gr.UpsertResource(ctx, wrappedResourceModel)

}

func (gr *GormRepository) UpsertRawResourceAssociation(
	ctx context.Context,
	sourceId string,
	sourceResourceType string,
	sourceResourceId string,
	targetSourceId string,
	targetResourceType string,
	targetResourceId string,
) error {

	if sourceId == targetSourceId && sourceResourceType == targetResourceType && sourceResourceId == targetResourceId {
		gr.Logger.Warnf("cannot create self-referential association, ignoring")
		return nil
	}
	var sourceCredential *models.SourceCredential
	var targetSourceCredential *models.SourceCredential
	var err error
	if sourceId == targetSourceId {
		sourceCredential, err = gr.GetSource(ctx, sourceId)
		if err != nil {
			return err
		}
		targetSourceCredential = sourceCredential
	} else {
		sourceCredential, err = gr.GetSource(ctx, sourceId)
		if err != nil {
			return err
		}
		targetSourceCredential, err = gr.GetSource(ctx, targetSourceId)
		if err != nil {
			return err
		}
	}

	//SECURITY: sourceCredential and targetSourceCredential are guaranteed to be owned by the same user, and will be confirmed within the addAssociation function
	return gr.AddResourceAssociation(ctx, sourceCredential, sourceResourceType, sourceResourceId, targetSourceCredential, targetResourceType, targetResourceId)
}

// UpsertResource
// this method will upsert a resource, however it will not create associations.
// UPSERT operation
// - call FindOrCreate
//   - check if the resource exists
//   - if it does not exist, insert it
//
// - if no error during FindOrCreate && no rows affected (nothing was created)
//   - update the resource using Updates operation
func (gr *GormRepository) UpsertResource(ctx context.Context, wrappedResourceModel *models.ResourceBase) (bool, error) {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return false, currentUserErr
	}

	wrappedResourceModel.UserID = currentUser.ID

	gr.Logger.Infof("insert/update FHIRResource (%v) %v", wrappedResourceModel.SourceResourceType, wrappedResourceModel.SourceResourceID)
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
		gr.Logger.Warnf("ignoring: an error occurred while extracting SearchParameters using FHIRPath (%s/%s): %v", wrappedResourceModel.SourceResourceType, wrappedResourceModel.SourceResourceID, err)
		//wrappedFhirResourceModel.SetResourceRaw(wrappedResourceModel.ResourceRaw)
	}

	eventSourceSync := models.NewEventSourceSync(
		currentUser.ID.String(),
		wrappedFhirResourceModel.GetSourceID().String(),
		wrappedFhirResourceModel.GetSourceResourceType(),
		wrappedFhirResourceModel.GetSourceResourceID(),
	)

	err = gr.EventBus.PublishMessage(eventSourceSync)
	if err != nil {
		gr.Logger.Warnf("ignoring: an error occurred while publishing event to eventBus (%s/%s): %v", wrappedResourceModel.SourceResourceType, wrappedResourceModel.SourceResourceID, err)
	}

	createResult := gr.GormClient.WithContext(ctx).Where(models.OriginBase{
		SourceID:           wrappedFhirResourceModel.GetSourceID(),
		SourceResourceID:   wrappedFhirResourceModel.GetSourceResourceID(),
		SourceResourceType: wrappedFhirResourceModel.GetSourceResourceType(), //TODO: and UpdatedAt > old UpdatedAt
	}).Omit("RelatedResource.*").Assign(wrappedResourceModel).FirstOrCreate(wrappedFhirResourceModel)

	if createResult.Error != nil {
		return false, createResult.Error
	}
	//resource was upserted
	return createResult.RowsAffected > 0, createResult.Error
}

func (gr *GormRepository) ListResources(ctx context.Context, queryOptions models.ListResourceQueryOptions) ([]models.ResourceBase, error) {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
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
	gr.Logger.Debugf("THE QUERY OBJECT===========> %v", string(manifestJson))

	var wrappedResourceModels []models.ResourceBase
	queryBuilder := gr.GormClient.WithContext(ctx)
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
		return gr.getResourcesFromAllTables(queryBuilder, queryParam)
	}
}

// TODO: should this be deprecated? (replaced by ListResources)
func (gr *GormRepository) GetResourceByResourceTypeAndId(ctx context.Context, sourceResourceType string, sourceResourceId string) (*models.ResourceBase, error) {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
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
	results := gr.GormClient.WithContext(ctx).
		Where(queryParam).
		Table(tableName).
		First(&wrappedResourceModel)

	return &wrappedResourceModel, results.Error
}

// we need to figure out how to get the source resource type from the source resource id, or if we're searching across every table :(
func (gr *GormRepository) GetResourceBySourceId(ctx context.Context, sourceId string, sourceResourceId string) (*models.ResourceBase, error) {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
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
	wrappedResourceModels, err := gr.getResourcesFromAllTables(gr.GormClient.WithContext(ctx), queryParam)
	if len(wrappedResourceModels) > 0 {
		return &wrappedResourceModels[0], err
	} else {
		return nil, fmt.Errorf("no resource found with source id %s and source resource id %s", sourceId, sourceResourceId)
	}
}

// Get the patient for each source (for the current user)
func (gr *GormRepository) GetPatientForSources(ctx context.Context) ([]models.ResourceBase, error) {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	//SELECT * FROM resource_bases WHERE user_id = "" and source_resource_type = "Patient" GROUP BY source_id

	tableName, err := databaseModel.GetTableNameByResourceType("Patient")
	if err != nil {
		return nil, err
	}

	var wrappedResourceModels []models.ResourceBase
	results := gr.GormClient.WithContext(ctx).
		//Group("source_id"). //broken in Postgres.
		Where(models.OriginBase{
			UserID:             currentUser.ID,
			SourceResourceType: "Patient",
		}).
		Table(tableName).
		Find(&wrappedResourceModels)

	return wrappedResourceModels, results.Error
}

//</editor-fold>

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Resource Associations
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//<editor-fold desc="Resource Associations">

// verifyAssociationPermission ensure that the sources are "owned" by the same user, and that the user is the current user
func (gr *GormRepository) verifyAssociationPermission(ctx context.Context, sourceUserID uuid.UUID, relatedSourceUserID uuid.UUID) error {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
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

func (gr *GormRepository) AddResourceAssociation(ctx context.Context, source *models.SourceCredential, resourceType string, resourceId string, relatedSource *models.SourceCredential, relatedResourceType string, relatedResourceId string) error {
	//ensure that the sources are "owned" by the same user
	err := gr.verifyAssociationPermission(ctx, source.UserID, relatedSource.UserID)
	if err != nil {
		return err
	}

	err = gr.GormClient.WithContext(ctx).Table("related_resources").Create(map[string]interface{}{
		"resource_base_user_id":                 source.UserID,
		"resource_base_source_id":               source.ID,
		"resource_base_source_resource_type":    resourceType,
		"resource_base_source_resource_id":      resourceId,
		"related_resource_user_id":              relatedSource.UserID,
		"related_resource_source_id":            relatedSource.ID,
		"related_resource_source_resource_type": relatedResourceType,
		"related_resource_source_resource_id":   relatedResourceId,
	}).Error
	uniqueConstraintError := errors.New("UNIQUE constraint failed")
	if err != nil {
		if strings.HasPrefix(err.Error(), uniqueConstraintError.Error()) {
			gr.Logger.Warnf("Ignoring an error when creating a related_resource association for %s/%s: %v", resourceType, resourceId, err)
			//we can safely ignore this error
			return nil
		}
	}
	return err
}

func (gr *GormRepository) RemoveResourceAssociation(ctx context.Context, source *models.SourceCredential, resourceType string, resourceId string, relatedSource *models.SourceCredential, relatedResourceType string, relatedResourceId string) error {
	//ensure that the sources are "owned" by the same user
	err := gr.verifyAssociationPermission(ctx, source.UserID, relatedSource.UserID)
	if err != nil {
		return err
	}

	//manually delete association
	results := gr.GormClient.WithContext(ctx).
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

func (gr *GormRepository) FindResourceAssociationsByTypeAndId(ctx context.Context, source *models.SourceCredential, resourceType string, resourceId string) ([]models.RelatedResource, error) {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	if source.UserID != currentUser.ID {
		return nil, fmt.Errorf("source credential must match the current user id")
	}

	// SELECT * FROM related_resources WHERE user_id = "53c1e930-63af-46c9-b760-8e83cbc1abd9";
	var relatedResources []models.RelatedResource
	result := gr.GormClient.WithContext(ctx).
		Where(models.RelatedResource{
			ResourceBaseUserID:             currentUser.ID,
			ResourceBaseSourceID:           source.ID,
			ResourceBaseSourceResourceType: resourceType,
			ResourceBaseSourceResourceID:   resourceId,
			RelatedResourceUserID:          currentUser.ID,
		}).
		Find(&relatedResources)
	return relatedResources, result.Error
}

// find all associations pointing TO and FROM the specified target resource
func (gr *GormRepository) FindAllResourceAssociations(ctx context.Context, source *models.SourceCredential, resourceType string, resourceId string) ([]models.RelatedResource, error) {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	if source.UserID != currentUser.ID {
		return nil, fmt.Errorf("source credential must match the current user id")
	}

	var relatedResources []models.RelatedResource
	result := gr.GormClient.WithContext(ctx).
		Where(models.RelatedResource{
			ResourceBaseUserID:             currentUser.ID,
			ResourceBaseSourceID:           source.ID,
			ResourceBaseSourceResourceType: resourceType,
			ResourceBaseSourceResourceID:   resourceId,
			RelatedResourceUserID:          currentUser.ID,
		}).
		Or(&models.RelatedResource{
			RelatedResourceUserID:             currentUser.ID,
			RelatedResourceSourceID:           source.ID,
			RelatedResourceSourceResourceType: resourceType,
			RelatedResourceSourceResourceID:   resourceId,
			ResourceBaseUserID:                currentUser.ID,
		}).
		Find(&relatedResources)

	return relatedResources, result.Error
}

// remove multiple resource associations in a transaction
func (gr *GormRepository) RemoveBulkResourceAssociations(ctx context.Context, associationsToDelete []models.RelatedResource) (int64, error) {
	var totalRowsAffected int64 = 0
	if len(associationsToDelete) == 0 {
		return 0, nil
	}

	txErr := gr.GormClient.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for _, assoc := range associationsToDelete {
			result := tx.Delete(&models.RelatedResource{}, map[string]interface{}{
				"resource_base_user_id":                 assoc.ResourceBaseUserID,
				"resource_base_source_id":               assoc.ResourceBaseSourceID,
				"resource_base_source_resource_type":    assoc.ResourceBaseSourceResourceType,
				"resource_base_source_resource_id":      assoc.ResourceBaseSourceResourceID,
				"related_resource_user_id":              assoc.RelatedResourceUserID,
				"related_resource_source_id":            assoc.RelatedResourceSourceID,
				"related_resource_source_resource_type": assoc.RelatedResourceSourceResourceType,
				"related_resource_source_resource_id":   assoc.RelatedResourceSourceResourceID,
			})

			if result.Error != nil {
				return result.Error
			}
			totalRowsAffected += result.RowsAffected
		}
		return nil
	})

	if txErr != nil {
		return totalRowsAffected, fmt.Errorf("RemoveResourceAssociations transaction failed: %w", txErr)
	}

	return totalRowsAffected, nil
}

//</editor-fold>

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Resource Composition (Grouping)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// AddResourceComposition
// this will group resources together into a "Composition" -- primarily to group related Encounters & Conditions into one semantic root.
// algorithm:
// - find source for each resource
// - (SECURITY) ensure the current user and the source for each resource matches
// - check if there is a Composition resource Type already.
//   - if Composition type already exists:
//   - update "relatesTo" field with additional data.
//   - else:
//   - Create a Composition resource type (populated with "relatesTo" references to all provided Resources)
//
// - add AddResourceAssociation for all resources linked to the Composition resource
// - store the Composition resource
// TODO: determine if we should be using a List Resource instead of a Composition resource
//
// Deprecated: This method has been deprecated. It has been replaced in favor of Fasten SourceCredential & associations
func (gr *GormRepository) AddResourceComposition(ctx context.Context, compositionTitle string, resources []*models.ResourceBase) error {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return currentUserErr
	}

	//generate placeholder source
	placeholderSource := models.SourceCredential{UserID: currentUser.ID, PlatformType: "manual", ModelBase: models.ModelBase{ID: uuid.Nil}}

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
			sourceCred, err := gr.GetSource(ctx, resource.SourceID.String())
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
				if err := gr.RemoveResourceAssociation(
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
			deleteResult := gr.GormClient.WithContext(ctx).
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
	_, err = gr.UpsertResource(ctx, compositionResource)
	if err != nil {
		return err
	}

	// - add AddResourceAssociation for all resources linked to the Composition resource
	for _, resource := range rawResourceLookupTable {
		if err := gr.AddResourceAssociation(
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

//<editor-fold desc="SourceCredential">

func (gr *GormRepository) CreateSource(ctx context.Context, sourceCreds *models.SourceCredential) error {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return currentUserErr
	}
	sourceCreds.UserID = currentUser.ID

	//Assign will **always** update the source credential in the DB with data passed into this function.
	return gr.GormClient.WithContext(ctx).
		Where(models.SourceCredential{
			UserID:     sourceCreds.UserID,
			EndpointID: sourceCreds.EndpointID,
			Patient:    sourceCreds.Patient}).
		Assign(*sourceCreds).FirstOrCreate(sourceCreds).Error
}

func (gr *GormRepository) UpdateSource(ctx context.Context, sourceCreds *models.SourceCredential) error {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return currentUserErr
	}
	sourceCreds.UserID = currentUser.ID

	//Assign will **always** update the source credential in the DB with data passed into this function.
	return gr.GormClient.WithContext(ctx).
		Where(models.SourceCredential{
			ModelBase:  models.ModelBase{ID: sourceCreds.ID},
			UserID:     sourceCreds.UserID,
			EndpointID: sourceCreds.EndpointID,
		}).Updates(models.SourceCredential{
		AccessToken:           sourceCreds.AccessToken,
		RefreshToken:          sourceCreds.RefreshToken,
		ExpiresAt:             sourceCreds.ExpiresAt,
		DynamicClientId:       sourceCreds.DynamicClientId,
		DynamicClientJWKS:     sourceCreds.DynamicClientJWKS,
		LatestBackgroundJobID: sourceCreds.LatestBackgroundJobID,
	}).Error
}

func (gr *GormRepository) GetSource(ctx context.Context, sourceId string) (*models.SourceCredential, error) {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	sourceUUID, err := uuid.Parse(sourceId)
	if err != nil {
		return nil, err
	}

	var sourceCred models.SourceCredential
	results := gr.GormClient.WithContext(ctx).
		Where(models.SourceCredential{UserID: currentUser.ID, ModelBase: models.ModelBase{ID: sourceUUID}}).
		Preload("LatestBackgroundJob").
		First(&sourceCred)

	return &sourceCred, results.Error
}

func (gr *GormRepository) GetSourceSummary(ctx context.Context, sourceId string) (*models.SourceSummary, error) {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	sourceUUID, err := uuid.Parse(sourceId)
	if err != nil {
		return nil, err
	}

	sourceSummary := &models.SourceSummary{}

	source, err := gr.GetSource(ctx, sourceId)
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
		result := gr.GormClient.WithContext(ctx).
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
	patientResults := gr.GormClient.WithContext(ctx).
		Where(models.OriginBase{
			UserID:             currentUser.ID,
			SourceResourceType: "Patient",
			SourceID:           sourceUUID,
		}).
		Table(patientTableName).
		First(&wrappedPatientResourceModel)

	//some sources may not have a patient resource (including the Fasten source)
	if patientResults.Error == nil {
		sourceSummary.Patient = &wrappedPatientResourceModel
	}

	return sourceSummary, nil
}

func (gr *GormRepository) GetSources(ctx context.Context) ([]models.SourceCredential, error) {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	var sourceCreds []models.SourceCredential
	results := gr.GormClient.WithContext(ctx).
		Where(models.SourceCredential{UserID: currentUser.ID}).
		Preload("LatestBackgroundJob").
		Find(&sourceCreds)

	return sourceCreds, results.Error
}

func (gr *GormRepository) DeleteSource(ctx context.Context, sourceId string) (int64, error) {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return 0, currentUserErr
	}

	if strings.TrimSpace(sourceId) == "" {
		return 0, fmt.Errorf("sourceId cannot be blank")
	}
	//delete all resources for this source
	sourceUUID, err := uuid.Parse(sourceId)
	if err != nil {
		return 0, err
	}

	rowsEffected := int64(0)
	resourceTypes := databaseModel.GetAllowedResourceTypes()
	for _, resourceType := range resourceTypes {
		tableName, err := databaseModel.GetTableNameByResourceType(resourceType)
		if err != nil {
			return 0, err
		}
		results := gr.GormClient.WithContext(ctx).
			Where(models.OriginBase{
				UserID:   currentUser.ID,
				SourceID: sourceUUID,
			}).
			Table(tableName).
			Delete(&models.ResourceBase{})
		rowsEffected += results.RowsAffected
		if results.Error != nil {
			return rowsEffected, results.Error
		}
	}

	//delete relatedResources entries
	results := gr.GormClient.WithContext(ctx).
		Where(models.RelatedResource{ResourceBaseUserID: currentUser.ID, ResourceBaseSourceID: sourceUUID}).
		Delete(&models.RelatedResource{})
	if results.Error != nil {
		return rowsEffected, results.Error
	}

	//soft delete the source credential
	results = gr.GormClient.WithContext(ctx).
		Where(models.SourceCredential{
			ModelBase: models.ModelBase{
				ID: sourceUUID,
			},
			UserID: currentUser.ID,
		}).
		Delete(&models.SourceCredential{})
	rowsEffected += results.RowsAffected
	return rowsEffected, results.Error
}

//</editor-fold>

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Background Job
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// <editor-fold desc="Background Job & Checkpoints">
func (gr *GormRepository) CreateBackgroundJob(ctx context.Context, backgroundJob *models.BackgroundJob) error {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return currentUserErr
	}

	backgroundJob.UserID = currentUser.ID

	record := gr.GormClient.Create(backgroundJob)
	return record.Error
}

func (gr *GormRepository) GetBackgroundJob(ctx context.Context, backgroundJobId string) (*models.BackgroundJob, error) {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	backgroundJobUUID, err := uuid.Parse(backgroundJobId)
	if err != nil {
		return nil, err
	}

	var backgroundJob models.BackgroundJob
	results := gr.GormClient.WithContext(ctx).
		Where(models.SourceCredential{UserID: currentUser.ID, ModelBase: models.ModelBase{ID: backgroundJobUUID}}).
		First(&backgroundJob)

	return &backgroundJob, results.Error
}

func (gr *GormRepository) UpdateBackgroundJob(ctx context.Context, backgroundJob *models.BackgroundJob) error {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return currentUserErr
	}
	backgroundJob.UserID = currentUser.ID

	return gr.GormClient.WithContext(ctx).
		Where(models.BackgroundJob{
			ModelBase: models.ModelBase{ID: backgroundJob.ID},
			UserID:    backgroundJob.UserID,
		}).Updates(models.BackgroundJob{
		JobStatus:  backgroundJob.JobStatus,
		Data:       backgroundJob.Data,
		LockedTime: backgroundJob.LockedTime,
		DoneTime:   backgroundJob.DoneTime,
		Retries:    backgroundJob.Retries,
		Schedule:   backgroundJob.Schedule,
	}).Error
}

func (gr *GormRepository) ListBackgroundJobs(ctx context.Context, queryOptions models.BackgroundJobQueryOptions) ([]models.BackgroundJob, error) {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	queryParam := models.BackgroundJob{
		UserID: currentUser.ID,
	}

	if queryOptions.JobType != nil {
		queryParam.JobType = *queryOptions.JobType
	}
	if queryOptions.Status != nil {
		queryParam.JobStatus = *queryOptions.Status
	}

	var backgroundJobs []models.BackgroundJob
	query := gr.GormClient.WithContext(ctx).
		//Group("source_id"). //broken in Postgres.
		Where(queryParam).Order("locked_time DESC")

	if queryOptions.Limit > 0 {
		query = query.Limit(queryOptions.Limit)
	}
	if queryOptions.Offset > 0 {
		query = query.Offset(queryOptions.Offset)
	}

	return backgroundJobs, query.Find(&backgroundJobs).Error
}

func (gr *GormRepository) BackgroundJobCheckpoint(ctx context.Context, checkpointData map[string]interface{}, errorData map[string]interface{}) {
	gr.Logger.Info("begin checkpointing background job...")
	if len(checkpointData) == 0 && len(errorData) == 0 {
		gr.Logger.Info("no changes detected. Skipping checkpoint")
		return //nothing to do
	}
	defer gr.Logger.Info("end checkpointing background job")

	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		gr.Logger.Warning("could not find current user info context. Ignoring checkpoint", currentUserErr)
		return
	}

	//make sure we do an atomic update
	backgroundJobId, ok := ctx.Value(pkg.ContextKeyTypeBackgroundJobID).(string)
	if !ok {
		gr.Logger.Warning("could not find background job id in context. Ignoring checkpoint")
		return
	}
	backgroundJobUUID, err := uuid.Parse(backgroundJobId)
	if err != nil {
		gr.Logger.Warning("could not parse background job id. Ignoring checkpoint", err)
		return
	}
	//https://gorm.io/docs/advanced_query.html#Locking-FOR-UPDATE
	//TODO: if using another database type (not SQLITE) we need to make sure we use the correct locking strategy
	//This is not a problem in SQLITE because it does database (or table) level locking by default
	//var backgroundJob models.BackgroundJob
	//gr.GormClient.Clauses(clause.Locking{Strength: "UPDATE"}).Find(&backgroundJob)

	txErr := gr.GormClient.Transaction(func(tx *gorm.DB) error {
		//retrieve the background job by id
		var backgroundJob models.BackgroundJob
		backgroundJobFindResults := tx.WithContext(ctx).
			Where(models.BackgroundJob{
				ModelBase: models.ModelBase{ID: backgroundJobUUID},
				UserID:    currentUser.ID,
			}).
			First(&backgroundJob)
		if backgroundJobFindResults.Error != nil {
			return backgroundJobFindResults.Error
		}

		//deserialize the job data
		var backgroundJobSyncData models.BackgroundJobSyncData
		if backgroundJob.Data != nil {
			err := json.Unmarshal(backgroundJob.Data, &backgroundJobSyncData)
			if err != nil {
				return err
			}
		}

		//update the job data with new data provided by the calling functiion
		changed := false
		if len(checkpointData) > 0 {
			backgroundJobSyncData.CheckpointData = checkpointData
			changed = true
		}
		if len(errorData) > 0 {
			backgroundJobSyncData.ErrorData = errorData
			changed = true
		}

		//define a background job with the fields we're going to update
		now := time.Now()
		updatedBackgroundJob := models.BackgroundJob{
			LockedTime: &now,
		}
		if changed {
			serializedData, err := json.Marshal(backgroundJobSyncData)
			if err != nil {
				return err
			}
			updatedBackgroundJob.Data = serializedData

		}

		return tx.WithContext(ctx).
			Where(models.BackgroundJob{
				ModelBase: models.ModelBase{ID: backgroundJobUUID},
				UserID:    currentUser.ID,
			}).Updates(updatedBackgroundJob).Error
	})

	if txErr != nil {
		gr.Logger.Warning("could not find or update background job. Ignoring checkpoint", txErr)
	}

}

// when server restarts, we should unlock all locked jobs, and set their status to failed
// SECURITY: this is global, and effects all users.
func (gr *GormRepository) CancelAllLockedBackgroundJobsAndFail() error {
	now := time.Now()
	return gr.GormClient.
		Where(models.BackgroundJob{JobStatus: pkg.BackgroundJobStatusLocked}).
		Updates(models.BackgroundJob{
			JobStatus: pkg.BackgroundJobStatusFailed,
			DoneTime:  &now,
		}).Error

}

//</editor-fold>

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Utilities
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Internal function
// This function will return a list of resources from all FHIR tables in the database
// The query allows us to set the  source id, source resource id, source resource type
// SECURITY: this function assumes the user has already been authenticated
// TODO: theres probably a more efficient way of doing this with GORM
func (gr *GormRepository) getResourcesFromAllTables(queryBuilder *gorm.DB, queryParam models.OriginBase) ([]models.ResourceBase, error) {
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
