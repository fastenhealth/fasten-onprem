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
	"log"
)

func NewRepository(appConfig config.Interface, globalLogger logrus.FieldLogger) (DatabaseRepository, error) {
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Couchdb setup
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	couchdbUrl := fmt.Sprintf("%s://%s:%s", appConfig.GetString("couchdb.scheme"), appConfig.GetString("couchdb.host"), appConfig.GetString("couchdb.port"))

	globalLogger.Infof("Trying to connect to couchdb: %s\n", couchdbUrl)

	database, err := kivik.New("couch", couchdbUrl)
	if err != nil {
		return nil, fmt.Errorf("Failed to connect to database! - %v", err)
	}

	err = database.Authenticate(context.Background(),
		couchdb.BasicAuth(
			appConfig.GetString("couchdb.admin.username"),
			appConfig.GetString("couchdb.admin.password")),
	)

	if err != nil {
		return nil, fmt.Errorf("Failed to authenticate to database! - %v", err)
	}
	globalLogger.Infof("Successfully connected to couchdb: %s\n", couchdbUrl)

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
	if err != nil {
		return err
	}

	//TODO: we should create an index for this database now
	//db.CreateIndex(ctx, )
	return err
}

func (cr *couchdbRepository) VerifyUser(ctx context.Context, user *models.User) error {

	couchdbUrl := fmt.Sprintf("%s://%s:%s", cr.appConfig.GetString("couchdb.scheme"), cr.appConfig.GetString("couchdb.host"), cr.appConfig.GetString("couchdb.port"))

	userDatabase, err := kivik.New("couch", couchdbUrl)
	if err != nil {
		return fmt.Errorf("Failed to connect to database! - %v", err)
	}

	err = userDatabase.Authenticate(context.Background(),
		couchdb.BasicAuth(user.Username, user.Password),
	)
	session, err := userDatabase.Session(context.Background())
	if err != nil {
		return err
	}
	log.Printf("SESSION INFO: %v", session)
	//TODO: return session info
	return nil
}

func (cr *couchdbRepository) Close() error {
	return nil
}
