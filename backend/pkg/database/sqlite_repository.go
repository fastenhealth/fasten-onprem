package database

import (
	"context"
	"encoding/json"
	"fmt"
	sourceModel "github.com/fastenhealth/fasten-sources/clients/models"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
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

	deviceRepo := SqliteRepository{
		AppConfig:  appConfig,
		Logger:     globalLogger,
		GormClient: database,
	}

	//TODO: automigrate for now
	err = deviceRepo.Migrate()
	if err != nil {
		return nil, err
	}

	// create/update admin user
	adminUser := models.User{}
	err = database.FirstOrCreate(&adminUser, models.User{Username: "admin"}).Error
	if err != nil {
		return nil, fmt.Errorf("Failed to create admin user! - %v", err)
	}

	return &deviceRepo, nil
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

func (sr *SqliteRepository) GetCurrentUser(ctx context.Context) *models.User {
	username := ctx.Value("AUTH_USERNAME")
	if username == nil {
		ginCtx := ctx.(*gin.Context)
		username = ginCtx.MustGet("AUTH_USERNAME")
	}

	var currentUser models.User
	sr.GormClient.First(&currentUser, models.User{Username: username.(string)})

	return &currentUser
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// User
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

func (sr *SqliteRepository) GetSummary(ctx context.Context) (*models.Summary, error) {

	// we want a count of all resources for this user by type
	var resourceCountResults []map[string]interface{}

	//group by resource type and return counts
	// SELECT source_resource_type as resource_type, COUNT(*) as count FROM resource_fhirs WHERE source_id = "53c1e930-63af-46c9-b760-8e83cbc1abd9" GROUP BY source_resource_type;
	result := sr.GormClient.WithContext(ctx).
		Model(models.ResourceFhir{}).
		Select("source_resource_type as resource_type, count(*) as count").
		Group("source_resource_type").
		Where(models.OriginBase{
			UserID: sr.GetCurrentUser(ctx).ID,
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
		ResourceRaw:         datatypes.JSON(rawResource.ResourceRaw),
		RelatedResourceFhir: nil,
	}

	//create associations
	//note: we create the association in the related_resources table **before** the model actually exists.

	if rawResource.ReferencedResources != nil {
		//these are resources that are referenced by the current resource
		relatedResources := []*models.ResourceFhir{}

		//reciprocalRelatedResources := []*models.ResourceFhir{}
		for _, referencedResource := range rawResource.ReferencedResources {
			parts := strings.Split(referencedResource, "/")
			if len(parts) == 2 {

				relatedResource := &models.ResourceFhir{
					OriginBase: models.OriginBase{
						SourceID:           source.ID,
						SourceResourceType: parts[0],
						SourceResourceID:   parts[1],
					},
					RelatedResourceFhir: nil,
				}
				relatedResources = append(relatedResources, relatedResource)

				//if the related resource is an Encounter or Condition, make sure we create a reciprocal association as well, just incase
				if parts[0] == "Condition" || parts[0] == "Encounter" {
					//manually create association (we've tried to create using Association.Append, and it doesnt work for some reason.
					err := sr.AddResourceAssociation(ctx, &source, parts[0], parts[1], &source, wrappedResourceModel.SourceResourceType, wrappedResourceModel.SourceResourceID)
					if err != nil {
						sr.Logger.Errorf("Error when creating a reciprocal association for %s: %v", referencedResource, err)
					}
				}

			}
		}

		//ignore errors when creating associations (we always get a 'WHERE conditions required' error, )
		sr.GormClient.WithContext(ctx).Model(wrappedResourceModel).Association("RelatedResourceFhir").Append(relatedResources)

	}

	sr.Logger.Infof("insert/update (%v) %v", rawResource.SourceResourceType, rawResource.SourceResourceID)

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
		if wrappedResourceModel.ResourceRaw.String() != string(rawResource.ResourceRaw) {
			updateResult := createResult.Omit("RelatedResourceFhir.*").Updates(wrappedResourceModel)
			return updateResult.RowsAffected > 0, updateResult.Error
		} else {
			return false, nil
		}

	} else {
		//resource was created
		return createResult.RowsAffected > 0, createResult.Error
	}

	//return results.RowsAffected > 0, results.Error

	//if sr.GormClient.Debug().WithContext(ctx).
	//	Where(models.OriginBase{
	//		SourceID:           wrappedResourceModel.GetSourceID(),
	//		SourceResourceID:   wrappedResourceModel.GetSourceResourceID(),
	//		SourceResourceType: wrappedResourceModel.GetSourceResourceType(), //TODO: and UpdatedAt > old UpdatedAt
	//	}).Updates(wrappedResourceModel).RowsAffected == 0 {
	//	sr.Logger.Infof("resource does not exist, creating: %s %s %s", wrappedResourceModel.GetSourceID(), wrappedResourceModel.GetSourceResourceID(), wrappedResourceModel.GetSourceResourceType())
	//	return sr.GormClient.Debug().Create(wrappedResourceModel).Error
	//}
	//return nil
}

func (sr *SqliteRepository) UpsertResource(ctx context.Context, resourceModel *models.ResourceFhir) error {
	sr.Logger.Infof("insert/update (%T) %v", resourceModel, resourceModel)

	if sr.GormClient.WithContext(ctx).
		Where(models.OriginBase{
			SourceID:           resourceModel.GetSourceID(),
			SourceResourceID:   resourceModel.GetSourceResourceID(),
			SourceResourceType: resourceModel.GetSourceResourceType(), //TODO: and UpdatedAt > old UpdatedAt
		}).Updates(resourceModel).RowsAffected == 0 {
		sr.Logger.Infof("resource does not exist, creating: %s %s %s", resourceModel.GetSourceID(), resourceModel.GetSourceResourceID(), resourceModel.GetSourceResourceType())
		return sr.GormClient.Create(resourceModel).Error
	}
	return nil
}

func (sr *SqliteRepository) ListResources(ctx context.Context, queryOptions models.ListResourceQueryOptions) ([]models.ResourceFhir, error) {

	queryParam := models.ResourceFhir{
		OriginBase: models.OriginBase{
			UserID: sr.GetCurrentUser(ctx).ID,
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
	queryParam := models.ResourceFhir{
		OriginBase: models.OriginBase{
			UserID:             sr.GetCurrentUser(ctx).ID,
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
	sourceIdUUID, err := uuid.Parse(sourceId)
	if err != nil {
		return nil, err
	}

	queryParam := models.ResourceFhir{
		OriginBase: models.OriginBase{
			UserID:           sr.GetCurrentUser(ctx).ID,
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
			UserID:             sr.GetCurrentUser(ctx).ID,
			SourceResourceType: "Patient",
		}).
		Find(&wrappedResourceModels)

	return wrappedResourceModels, results.Error
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Resource Associations
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

func (sr *SqliteRepository) AddResourceAssociation(ctx context.Context, source *models.SourceCredential, resourceType string, resourceId string, relatedSource *models.SourceCredential, relatedResourceType string, relatedResourceId string) error {
	//ensure that the sources are "owned" by the same user

	if source.UserID != relatedSource.UserID {
		return fmt.Errorf("user id's must match when adding associations")
	} else if source.UserID != sr.GetCurrentUser(ctx).ID {
		return fmt.Errorf("user id's must match current user")
	}

	//manually create association (we've tried to create using Association.Append, and it doesnt work for some reason.
	return sr.GormClient.WithContext(ctx).Table("related_resources").Create(map[string]interface{}{
		"resource_fhir_source_id":                    source.ID,
		"resource_fhir_source_resource_type":         resourceType,
		"resource_fhir_source_resource_id":           resourceId,
		"related_resource_fhir_source_id":            relatedSource.ID,
		"related_resource_fhir_source_resource_type": relatedResourceType,
		"related_resource_fhir_source_resource_id":   relatedResourceId,
	}).Error
}

func (sr *SqliteRepository) RemoveResourceAssociation(ctx context.Context, source *models.SourceCredential, resourceType string, resourceId string, relatedSource *models.SourceCredential, relatedResourceType string, relatedResourceId string) error {
	if source.UserID != relatedSource.UserID {
		return fmt.Errorf("user id's must match when adding associations")
	} else if source.UserID != sr.GetCurrentUser(ctx).ID {
		return fmt.Errorf("user id's must match current user")
	}

	//manually create association (we've tried to create using Association.Append, and it doesnt work for some reason.
	return sr.GormClient.WithContext(ctx).Table("related_resources").Delete(map[string]interface{}{
		"resource_fhir_source_id":                    source.ID,
		"resource_fhir_source_resource_type":         resourceType,
		"resource_fhir_source_resource_id":           resourceId,
		"related_resource_fhir_source_id":            relatedSource.ID,
		"related_resource_fhir_source_resource_type": relatedResourceType,
		"related_resource_fhir_source_resource_id":   relatedResourceId,
	}).Error
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SourceCredential
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

func (sr *SqliteRepository) CreateSource(ctx context.Context, sourceCreds *models.SourceCredential) error {
	sourceCreds.UserID = sr.GetCurrentUser(ctx).ID

	//Assign will **always** update the source credential in the DB with data passed into this function.
	return sr.GormClient.WithContext(ctx).
		Where(models.SourceCredential{
			UserID:     sourceCreds.UserID,
			SourceType: sourceCreds.SourceType,
			Patient:    sourceCreds.Patient}).
		Assign(*sourceCreds).FirstOrCreate(sourceCreds).Error
}

func (sr *SqliteRepository) GetSource(ctx context.Context, sourceId string) (*models.SourceCredential, error) {
	sourceUUID, err := uuid.Parse(sourceId)
	if err != nil {
		return nil, err
	}

	var sourceCred models.SourceCredential
	results := sr.GormClient.WithContext(ctx).
		Where(models.SourceCredential{UserID: sr.GetCurrentUser(ctx).ID, ModelBase: models.ModelBase{ID: sourceUUID}}).
		First(&sourceCred)

	return &sourceCred, results.Error
}

func (sr *SqliteRepository) GetSourceSummary(ctx context.Context, sourceId string) (*models.SourceSummary, error) {
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
			UserID:   sr.GetCurrentUser(ctx).ID,
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
			UserID:             sr.GetCurrentUser(ctx).ID,
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

	var sourceCreds []models.SourceCredential
	results := sr.GormClient.WithContext(ctx).
		Where(models.SourceCredential{UserID: sr.GetCurrentUser(ctx).ID}).
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
