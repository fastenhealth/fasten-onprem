package database

import (
	"context"
	"fmt"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"net/url"
)

func NewRepository(appConfig config.Interface, globalLogger logrus.FieldLogger) (DatabaseRepository, error) {
	//backgroundContext := context.Background()

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Gorm/SQLite setup
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	globalLogger.Infof("Trying to connect to sqlite db: %s\n", appConfig.GetString("web.database.location"))

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
	database, err := gorm.Open(sqlite.Open(appConfig.GetString("web.database.location")+pragmaStr), &gorm.Config{
		//TODO: figure out how to log database queries again.
		//Logger: logger
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		return nil, fmt.Errorf("Failed to connect to database! - %v", err)
	}
	globalLogger.Infof("Successfully connected to scrutiny sqlite db: %s\n", appConfig.GetString("web.database.location"))

	//TODO: automigrate for now
	err = database.AutoMigrate(
		&models.User{},
		&models.Source{},
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
	record := sr.gormClient.Create(&user)
	if record.Error != nil {
		return record.Error
	}
	return nil
}
func (sr *sqliteRepository) GetUserByEmail(ctx context.Context, username string) (*models.User, error) {
	var foundUser models.User
	result := sr.gormClient.Model(models.User{}).Where(models.User{Username: username}).First(&foundUser)
	return &foundUser, result.Error
}

func (sr *sqliteRepository) GetCurrentUser(ctx context.Context) models.User {
	ginCtx := ctx.(*gin.Context)
	var currentUser models.User
	sr.gormClient.Model(models.User{}).First(&currentUser, models.User{Username: ginCtx.MustGet("AUTH_USERNAME").(string)})

	return currentUser
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Resource
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

func (sr *sqliteRepository) UpsertResource(ctx context.Context, resourceModel models.ResourceFhir) error {
	sr.logger.Infof("insert/update (%T) %v", resourceModel, resourceModel)

	if sr.gormClient.Debug().WithContext(ctx).Model(&resourceModel).
		Where(models.OriginBase{
			SourceID:           resourceModel.GetSourceID(),
			SourceResourceID:   resourceModel.GetSourceResourceID(),
			SourceResourceType: resourceModel.GetSourceResourceType(), //TODO: and UpdatedAt > old UpdatedAt
		}).Updates(&resourceModel).RowsAffected == 0 {
		sr.logger.Infof("resource does not exist, creating: %s %s %s", resourceModel.GetSourceID(), resourceModel.GetSourceResourceID(), resourceModel.GetSourceResourceType())
		return sr.gormClient.Debug().Model(&resourceModel).Create(&resourceModel).Error
	}
	return nil
}

func (sr *sqliteRepository) ListResources(ctx context.Context, sourceResourceType string, sourceResourceId string) ([]models.ResourceFhir, error) {

	queryParam := models.ResourceFhir{
		OriginBase: models.OriginBase{
			UserID:             sr.GetCurrentUser(ctx).ID,
			SourceResourceType: sourceResourceType,
		},
	}

	if len(sourceResourceId) > 0 {
		queryParam.SourceResourceID = sourceResourceId
	}

	var wrappedResourceModels []models.ResourceFhir
	results := sr.gormClient.WithContext(ctx).
		Where(queryParam).
		Find(&wrappedResourceModels)

	return wrappedResourceModels, results.Error
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Source
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

func (sr *sqliteRepository) CreateSource(ctx context.Context, sourceCreds *models.Source) error {
	sourceCreds.UserID = sr.GetCurrentUser(ctx).ID

	if sr.gormClient.WithContext(ctx).Model(&sourceCreds).
		Where(models.Source{
			UserID:     sourceCreds.UserID,
			SourceType: sourceCreds.SourceType,
			PatientId:  sourceCreds.PatientId}).Updates(&sourceCreds).RowsAffected == 0 {
		return sr.gormClient.WithContext(ctx).Create(&sourceCreds).Error
	}
	return nil
}

func (sr *sqliteRepository) GetSources(ctx context.Context) ([]models.Source, error) {

	var sourceCreds []models.Source
	results := sr.gormClient.WithContext(ctx).
		Where(models.Source{UserID: sr.GetCurrentUser(ctx).ID}).
		Find(&sourceCreds)

	return sourceCreds, results.Error
}

//func (sr *sqliteRepository) GetSource(ctx context.Context, providerId string) (models.Source, error) {
//
//	var providerCredentials models.Source
//	results := sr.gormClient.WithContext(ctx).
//		Where(models.Source{UserID: sr.GetCurrentUser().ID, SourceType: providerId}).
//		Find(&providerCredentials)
//
//	return providerCredential, results.Error
//}

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
