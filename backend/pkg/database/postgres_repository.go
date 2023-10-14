package database

import (
	"fmt"
	"strings"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	databaseModel "github.com/fastenhealth/fasten-onprem/backend/pkg/models/database"
	"github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func newPostgresRepository(appConfig config.Interface, globalLogger logrus.FieldLogger, eventBus event_bus.Interface) (DatabaseRepository, error) {
	//backgroundContext := context.Background()

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Gorm/PostgreSQL setup
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	globalLogger.Infof("Trying to connect to postgres db: %s\n", appConfig.GetString("database.location"))
	dsn := appConfig.GetString("database.location")

	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		//TODO: figure out how to log database queries again.
		//logger: logger
		DisableForeignKeyConstraintWhenMigrating: true,
	})

	if strings.ToUpper(appConfig.GetString("log.level")) == "DEBUG" {
		database = database.Debug() //set debug globally
	}

	if err != nil {
		return nil, fmt.Errorf("Failed to connect to database! - %v", err)
	}
	globalLogger.Infof("Successfully connected to fasten postgres db: %s\n", dsn)

	fastenRepo := GormRepository{
		AppConfig:  appConfig,
		Logger:     globalLogger,
		GormClient: database,
		EventBus:   eventBus,
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

	//fail any Locked jobs. This is necessary because the job may have been locked by a process that was killed.
	err = fastenRepo.CancelAllLockedBackgroundJobsAndFail()
	if err != nil {
		return nil, err
	}

	return &fastenRepo, nil
}
