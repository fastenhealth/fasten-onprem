package database

import (
	"context"
	"fmt"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
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
		&models.Profile{},
		&models.Organization{},
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

func (sr *sqliteRepository) GetCurrentUser() models.User {
	var currentUser models.User
	sr.gormClient.Model(models.User{}).First(&currentUser)

	return currentUser
}

// UpsertSourceResource Create or Update record in database
func (sr *sqliteRepository) UpsertProfile(ctx context.Context, profile *models.Profile) error {
	if sr.gormClient.Debug().WithContext(ctx).Model(profile).
		Where(models.OriginBase{
			SourceID:           profile.GetSourceID(),
			SourceResourceID:   profile.GetSourceResourceID(),
			SourceResourceType: profile.GetSourceResourceType(), //TODO: and UpdatedAt > old UpdatedAt
		}).Updates(profile).RowsAffected == 0 {
		sr.logger.Infof("profile does not exist, creating: %s %s %s", profile.GetSourceID(), profile.GetSourceResourceID(), profile.GetSourceResourceType())
		return sr.gormClient.Debug().Create(profile).Error
	}
	return nil
}

func (sr *sqliteRepository) UpsertOrganziation(ctx context.Context, org *models.Organization) error {
	if sr.gormClient.Debug().WithContext(ctx).Model(org).
		Where(models.OriginBase{
			SourceID:           org.GetSourceID(),
			SourceResourceID:   org.GetSourceResourceID(),
			SourceResourceType: org.GetSourceResourceType(), //TODO: and UpdatedAt > old UpdatedAt
		}).Updates(org).RowsAffected == 0 {
		sr.logger.Infof("org does not exist, creating: %s %s %s", org.GetSourceID(), org.GetSourceResourceID(), org.GetSourceResourceType())
		return sr.gormClient.Debug().Create(org).Error
	}
	return nil
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ProviderCredentials
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

func (sr *sqliteRepository) CreateSource(ctx context.Context, providerCreds *models.Source) error {
	providerCreds.UserID = sr.GetCurrentUser().ID

	if sr.gormClient.WithContext(ctx).Model(&providerCreds).
		Where(models.Source{
			UserID:     providerCreds.UserID,
			ProviderId: providerCreds.ProviderId,
			PatientId:  providerCreds.PatientId}).Updates(&providerCreds).RowsAffected == 0 {
		return sr.gormClient.WithContext(ctx).Create(&providerCreds).Error
	}
	return nil
}

func (sr *sqliteRepository) GetSources(ctx context.Context) ([]models.Source, error) {

	var providerCredentials []models.Source
	results := sr.gormClient.WithContext(ctx).
		Where(models.Source{UserID: sr.GetCurrentUser().ID}).
		Find(&providerCredentials)

	return providerCredentials, results.Error
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
