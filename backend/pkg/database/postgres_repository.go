package database

import (
	"fmt"
	"strings"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	databaseModel "github.com/fastenhealth/fasten-onprem/backend/pkg/models/database"
	"github.com/glebarez/sqlite"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func newPostgresRepository(appConfig config.Interface, globalLogger logrus.FieldLogger, eventBus event_bus.Interface) (DatabaseRepository, error) {
	//backgroundContext := context.Background()

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Gorm/PostgreSQL setup
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	globalLogger.Infof("Trying to connect to sqlite db: %s\n", appConfig.GetString("database.location"))

	// BUSY TIMEOUT SETTING DOCS ---
	// When a transaction cannot lock the database, because it is already locked by another one,
	// SQLite by default throws an error: database is locked. This behavior is usually not appropriate when
	// concurrent access is needed, typically when multiple processes write to the same database.
	// PRAGMA busy_timeout lets you set a timeout or a handler for these events. When setting a timeout,
	// SQLite will try the transaction multiple times within this timeout.
	// fixes #341
	// https://rsqlite.r-dbi.org/reference/sqlitesetbusyhandler
	// retrying for 30000 milliseconds, 30seconds - this would be unreasonable for a distributed multi-tenant application,
	// but should be fine for local usage.
	//
	// JOURNAL MODE WAL DOCS ---
	//
	// Write-Ahead Logging or WAL (New Way)
	// In this case all writes are appended to a temporary file (write-ahead log) and this file is periodically merged with the original database. When SQLite is searching for something it would first check this temporary file and if nothing is found proceed with the main database file.
	// As a result, readers don’t compete with writers and performance is much better compared to the Old Way.
	// https://stackoverflow.com/questions/4060772/sqlite-concurrent-access
	// pragmaStr := sqlitePragmaString(map[string]string{
	// 	"busy_timeout": "5000",
	// 	"foreign_keys": "ON",
	// 	"journal_mode": "wal",
	// })
	// dsn := "file:" + appConfig.GetString("database.location") + pragmaStr
	dsn := appConfig.GetString("database.location")
	database, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{
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

	////verify journal mode
	//var journalMode []map[string]interface{}
	//resp := database.Raw("PRAGMA journal_mode;").Scan(&journalMode)
	//if resp.Error != nil {
	//	return nil, fmt.Errorf("Failed to verify journal mode! - %v", resp.Error)
	//} else {
	//	globalLogger.Infof("Journal mode: %v", journalMode)
	//}

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
