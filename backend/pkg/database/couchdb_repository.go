package database

import (
	"context"
	"fmt"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/go-kivik/couchdb/v3"
	_ "github.com/go-kivik/couchdb/v3" // The CouchDB driver
	"github.com/go-kivik/kivik/v3"
	"github.com/sirupsen/logrus"
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

	couchdbUrl := fmt.Sprintf("%s://%s:%s", appConfig.GetString("web.couchdb.scheme"), appConfig.GetString("web.couchdb.host"), appConfig.GetString("web.couchdb.port"))
	database, err := kivik.New("couch", couchdbUrl)
	if err != nil {
		return nil, fmt.Errorf("Failed to connect to database! - %v", err)
	}

	err = database.Authenticate(context.Background(),
		couchdb.BasicAuth(
			appConfig.GetString("web.couchdb.admin_username"),
			appConfig.GetString("web.couchdb.admin_password")),
	)

	if err != nil {
		return nil, fmt.Errorf("Failed to authenticate to database! - %v", err)
	}
	globalLogger.Infof("Successfully connected to coubdb: %s\n", couchdbUrl)

	deviceRepo := couchdbRepository{
		appConfig: appConfig,
		logger:    globalLogger,
		client:    database,
	}
	return &deviceRepo, nil
}

type couchdbRepository struct {
	appConfig config.Interface
	logger    logrus.FieldLogger

	client *kivik.Client
}

type couchDbUser struct {
	ID       string   `json:"_id"`
	Name     string   `json:"name"`
	Type     string   `json:"type"`
	Roles    []string `json:"roles"`
	Password string   `json:"password"`
}

func (cr *couchdbRepository) CreateUser(ctx context.Context, user *models.User) error {

	newUser := &couchDbUser{
		ID:       fmt.Sprintf("%s%s", kivik.UserPrefix, user.Username),
		Name:     user.Username,
		Type:     "user",
		Roles:    []string{},
		Password: user.Password,
	}
	db := cr.client.DB(ctx, "_users")
	_, err := db.Put(ctx, newUser.ID, newUser)
	return err
}

func (cr *couchdbRepository) Close() error {
	return nil
}
