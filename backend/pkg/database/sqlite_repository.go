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
	"gorm.io/gorm"
	"net/url"
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
		//Logger: logger
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		return nil, fmt.Errorf("Failed to connect to database! - %v", err)
	}
	globalLogger.Infof("Successfully connected to fasten sqlite db: %s\n", appConfig.GetString("database.location"))

	//TODO: automigrate for now
	err = database.AutoMigrate(
		&models.User{},
		&models.SourceCredential{},
		&models.ResourceFhir{},
	)
	if err != nil {
		return nil, fmt.Errorf("Failed to automigrate! - %v", err)
	}

	// create/update admin user
	adminUser := models.User{}
	err = database.FirstOrCreate(&adminUser, models.User{Username: "admin"}).Error
	if err != nil {
		return nil, fmt.Errorf("Failed to create admin user! - %v", err)
	}

	deviceRepo := sqliteRepository{
		appConfig:  appConfig,
		logger:     globalLogger,
		gormClient: database,
	}
	return &deviceRepo, nil
}

type sqliteRepository struct {
	appConfig config.Interface
	logger    logrus.FieldLogger

	gormClient *gorm.DB
}

func (sr *sqliteRepository) VerifyUser(ctx context.Context, user *models.User) error {
	//TODO implement me
	panic("implement me")
}

func (sr *sqliteRepository) Close() error {
	return nil
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// User
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

func (sr *sqliteRepository) CreateUser(ctx context.Context, user *models.User) error {
	if err := user.HashPassword(user.Password); err != nil {
		return err
	}
	record := sr.gormClient.Create(user)
	if record.Error != nil {
		return record.Error
	}
	return nil
}
func (sr *sqliteRepository) GetUserByEmail(ctx context.Context, username string) (*models.User, error) {
	var foundUser models.User
	result := sr.gormClient.Where(models.User{Username: username}).First(&foundUser)
	return &foundUser, result.Error
}

func (sr *sqliteRepository) GetCurrentUser(ctx context.Context) *models.User {
	ginCtx := ctx.(*gin.Context)
	var currentUser models.User
	sr.gormClient.First(&currentUser, models.User{Username: ginCtx.MustGet("AUTH_USERNAME").(string)})

	return &currentUser
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// User
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

func (sr *sqliteRepository) GetSummary(ctx context.Context) (*models.Summary, error) {

	// we want a count of all resources for this user by type
	var resourceCountResults []map[string]interface{}

	//group by resource type and return counts
	// SELECT source_resource_type as resource_type, COUNT(*) as count FROM resource_fhirs WHERE source_id = "53c1e930-63af-46c9-b760-8e83cbc1abd9" GROUP BY source_resource_type;
	result := sr.gormClient.WithContext(ctx).
		Model(models.ResourceFhir{}).
		Select("source_id, source_resource_type as resource_type, count(*) as count").
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

func (sr *sqliteRepository) UpsertRawResource(ctx context.Context, sourceCredentials sourceModel.SourceCredential, rawResource sourceModel.ResourceInterface) error {
	//TODO implement me
	panic("implement me")
}

func (sr *sqliteRepository) UpsertResource(ctx context.Context, resourceModel *models.ResourceFhir) error {
	sr.logger.Infof("insert/update (%T) %v", resourceModel, resourceModel)

	if sr.gormClient.Debug().WithContext(ctx).
		Where(models.OriginBase{
			SourceID:           resourceModel.GetSourceID(),
			SourceResourceID:   resourceModel.GetSourceResourceID(),
			SourceResourceType: resourceModel.GetSourceResourceType(), //TODO: and UpdatedAt > old UpdatedAt
		}).Updates(resourceModel).RowsAffected == 0 {
		sr.logger.Infof("resource does not exist, creating: %s %s %s", resourceModel.GetSourceID(), resourceModel.GetSourceResourceID(), resourceModel.GetSourceResourceType())
		return sr.gormClient.Debug().Create(resourceModel).Error
	}
	return nil
}

func (sr *sqliteRepository) ListResources(ctx context.Context, queryOptions models.ListResourceQueryOptions) ([]models.ResourceFhir, error) {

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

	manifestJson, _ := json.MarshalIndent(queryParam, "", "  ")
	sr.logger.Infof("THE QUERY OBJECT===========> %v", string(manifestJson))

	var wrappedResourceModels []models.ResourceFhir
	results := sr.gormClient.WithContext(ctx).
		Where(queryParam).
		Find(&wrappedResourceModels)

	return wrappedResourceModels, results.Error
}

func (sr *sqliteRepository) GetResourceBySourceType(ctx context.Context, sourceResourceType string, sourceResourceId string) (*models.ResourceFhir, error) {
	queryParam := models.ResourceFhir{
		OriginBase: models.OriginBase{
			UserID:             sr.GetCurrentUser(ctx).ID,
			SourceResourceType: sourceResourceType,
			SourceResourceID:   sourceResourceId,
		},
	}

	var wrappedResourceModel models.ResourceFhir
	results := sr.gormClient.WithContext(ctx).
		Where(queryParam).
		First(&wrappedResourceModel)

	return &wrappedResourceModel, results.Error
}

func (sr *sqliteRepository) GetResourceBySourceId(ctx context.Context, sourceId string, sourceResourceId string) (*models.ResourceFhir, error) {
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
	results := sr.gormClient.WithContext(ctx).
		Where(queryParam).
		First(&wrappedResourceModel)

	return &wrappedResourceModel, results.Error
}

// Get the patient for each source (for the current user)
func (sr *sqliteRepository) GetPatientForSources(ctx context.Context) ([]models.ResourceFhir, error) {

	//SELECT * FROM resource_fhirs WHERE user_id = "" and source_resource_type = "Patient" GROUP BY source_id

	//var sourceCred models.SourceCredential
	//results := sr.gormClient.WithContext(ctx).
	//	Where(models.SourceCredential{UserID: sr.GetCurrentUser(ctx).ID, ModelBase: models.ModelBase{ID: sourceUUID}}).
	//	First(&sourceCred)

	var wrappedResourceModels []models.ResourceFhir
	results := sr.gormClient.WithContext(ctx).
		Model(models.ResourceFhir{}).
		Group("source_id").
		Where(models.OriginBase{
			UserID:             sr.GetCurrentUser(ctx).ID,
			SourceResourceType: "Patient",
		}).
		Find(&wrappedResourceModels)

	return wrappedResourceModels, results.Error
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SourceCredential
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

func (sr *sqliteRepository) CreateSource(ctx context.Context, sourceCreds *models.SourceCredential) error {
	sourceCreds.UserID = sr.GetCurrentUser(ctx).ID

	if sr.gormClient.WithContext(ctx).
		Where(models.SourceCredential{
			UserID:     sourceCreds.UserID,
			SourceType: sourceCreds.SourceType,
			PatientId:  sourceCreds.PatientId}).Updates(sourceCreds).RowsAffected == 0 {
		return sr.gormClient.WithContext(ctx).Create(sourceCreds).Error
	}
	return nil
}

func (sr *sqliteRepository) GetSource(ctx context.Context, sourceId string) (*models.SourceCredential, error) {
	sourceUUID, err := uuid.Parse(sourceId)
	if err != nil {
		return nil, err
	}

	var sourceCred models.SourceCredential
	results := sr.gormClient.WithContext(ctx).
		Where(models.SourceCredential{UserID: sr.GetCurrentUser(ctx).ID, ModelBase: models.ModelBase{ID: sourceUUID}}).
		First(&sourceCred)

	return &sourceCred, results.Error
}

func (sr *sqliteRepository) GetSourceSummary(ctx context.Context, sourceId string) (*models.SourceSummary, error) {
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

	result := sr.gormClient.WithContext(ctx).
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
	results := sr.gormClient.WithContext(ctx).
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

func (sr *sqliteRepository) GetSources(ctx context.Context) ([]models.SourceCredential, error) {

	var sourceCreds []models.SourceCredential
	results := sr.gormClient.WithContext(ctx).
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
