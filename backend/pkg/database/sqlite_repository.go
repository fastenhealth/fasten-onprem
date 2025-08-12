package database

import (
	"fmt"
	"net/url"
	"strings"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/sirupsen/logrus"

	//"github.com/glebarez/sqlite"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// uses github.com/mattn/go-sqlite3 driver (warning, uses CGO)
func newSqliteRepository(appConfig config.Interface, globalLogger logrus.FieldLogger, eventBus event_bus.Interface, validationMode bool) (DatabaseRepository, error) {
	//backgroundContext := context.Background()

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Gorm/SQLite setup
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
	//
	// NOTE: this schema is driver specific, and may not work with other drivers.
	// eg.https://github.com/mattn/go-sqlite3 uses `?_journal_mode=WAL` prefixes
	// https://github.com/glebarez/sqlite uses `?_pragma=journal_mode(WAL)`
	// see https://github.com/mattn/go-sqlite3/compare/master...jgiannuzzi:go-sqlite3:sqlite3mc
	// see https://github.com/mattn/go-sqlite3/pull/1109
	pragmaOpts := map[string]string{
		"_busy_timeout": "5000",
		"_foreign_keys": "on",
		"_journal_mode": "WAL",
	}

	if validationMode {
		pragmaOpts["mode"] = "ro"
	}

	if appConfig.GetBool("database.encryption.enabled") {
		encryptionKey := appConfig.GetString("database.encryption.key")
		if encryptionKey == "" {
			return nil, fmt.Errorf("database encryption key is not set")
		}

		// Configure sqlcipher
		pragmaOpts["_cipher"] = "sqlcipher"
		pragmaOpts["_legacy"] = "3"
		pragmaOpts["_hmac_use"] = "off"
		pragmaOpts["_kdf_iter"] = "4000"
		pragmaOpts["_legacy_page_size"] = "1024"
		pragmaOpts["_key"] = encryptionKey
	}

	pragmaStr := sqlitePragmaString(pragmaOpts)

	dsn := "file:" + appConfig.GetString("database.location") + pragmaStr
	database, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{
		//TODO: figure out how to log database queries again.
		//logger: logger
		DisableForeignKeyConstraintWhenMigrating: true,
	})

	if err != nil {
		if strings.Contains(err.Error(), "file is not a database") {
			return nil, fmt.Errorf("failed to connect to database! encryption key may be incorrect - %w", err)
		}

		return nil, fmt.Errorf("failed to connect to database! - %w", err)
	}
	if strings.ToUpper(appConfig.GetString("log.level")) == "DEBUG" {
		database = database.Debug() //set debug globally
	}
	globalLogger.Infof("Successfully connected to fasten sqlite db: %s\n", dsn)

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

	if !validationMode {
		err = fastenRepo.Migrate()
		if err != nil {
			return nil, err
		}

		//fail any Locked jobs. This is necessary because the job may have been locked by a process that was killed.
		err = fastenRepo.CancelAllLockedBackgroundJobsAndFail()
		if err != nil {
			return nil, err
		}
	}

	return &fastenRepo, nil
}

func sqlitePragmaString(pragmas map[string]string) string {
	q := url.Values{}
	for key, val := range pragmas {
		//q.Add("_pragma", fmt.Sprintf("%s=%s", key, val))
		q.Add(key, val)
	}

	queryStr := q.Encode()
	if len(queryStr) > 0 {
		return "?" + queryStr
	}
	return ""
}
