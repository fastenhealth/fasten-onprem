package database

import (
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"testing"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	mock_config "github.com/fastenhealth/fasten-onprem/backend/pkg/config/mock"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	sourceFactory "github.com/fastenhealth/fasten-sources/clients/factory"
	sourcePkg "github.com/fastenhealth/fasten-sources/pkg"
	"github.com/golang/mock/gomock"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
)

// Define the suite, and absorb the built-in basic suite
// functionality from testify - including a T() method which
// returns the current testing context
type RepositoryGraphTestSuite struct {
	suite.Suite
	MockCtrl     *gomock.Controller
	TestDatabase *os.File
}

// BeforeTest has a function to be executed right before the test starts and receives the suite and test names as input
func (suite *RepositoryGraphTestSuite) BeforeTest(suiteName, testName string) {
	suite.MockCtrl = gomock.NewController(suite.T())

	dbFile, err := ioutil.TempFile("", fmt.Sprintf("%s.*.db", testName))
	if err != nil {
		log.Fatal(err)
	}
	suite.TestDatabase = dbFile

}

// AfterTest has a function to be executed right after the test finishes and receives the suite and test names as input
func (suite *RepositoryGraphTestSuite) AfterTest(suiteName, testName string) {
	suite.MockCtrl.Finish()
	os.Remove(suite.TestDatabase.Name())
	os.Remove(suite.TestDatabase.Name() + "-shm")
	os.Remove(suite.TestDatabase.Name() + "-wal")
}

// In order for 'go test' to run this suite, we need to create
// a normal test function and pass our suite to suite.Run
func TestRepositoryGraphTestSuite(t *testing.T) {
	suite.Run(t, new(RepositoryGraphTestSuite))
}

func (suite *RepositoryGraphTestSuite) TestGetFlattenedResourceGraph() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
	fakeConfig.EXPECT().IsSet("search").Return(false).AnyTimes()
	fakeConfig.EXPECT().GetString("log.level").Return("INFO").AnyTimes()
	dbRepo, err := NewRepository(fakeConfig, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())
	require.NoError(suite.T(), err)

	userModel := &models.User{
		Username: "test_username",
		Password: "testpassword",
		Email:    "test@test.com",
	}
	err = dbRepo.CreateUser(context.Background(), userModel)
	require.NoError(suite.T(), err)
	require.NotEmpty(suite.T(), userModel.ID)
	require.NotEqual(suite.T(), uuid.Nil, userModel.ID)
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	testSourceCredential := models.SourceCredential{
		ModelBase: models.ModelBase{
			ID: uuid.New(),
		},
		UserID:       userModel.ID,
		Patient:      uuid.New().String(),
		PlatformType: sourcePkg.PlatformTypeManual,
	}
	err = dbRepo.CreateSource(authContext, &testSourceCredential)
	require.NoError(suite.T(), err)

	bundleFile, err := os.Open("./testdata/Abraham100_Heller342_262b819a-5193-404a-9787-b7f599358035.json")
	require.NoError(suite.T(), err)

	testLogger := logrus.WithFields(logrus.Fields{
		"type": "test",
	})

	manualClient, err := sourceFactory.GetSourceClient(sourcePkg.FastenLighthouseEnvSandbox, authContext, testLogger, &testSourceCredential)

	summary, err := manualClient.SyncAllBundle(dbRepo, bundleFile, sourcePkg.FhirVersion401)
	require.NoError(suite.T(), err)
	require.Equal(suite.T(), 198, summary.TotalResources)
	require.Equal(suite.T(), 234, len(summary.UpdatedResources))

	//test
	options := models.ResourceGraphOptions{
		ResourcesIds: []models.OriginBase{
			{
				SourceID:           testSourceCredential.ID,
				SourceResourceType: "Encounter",
				SourceResourceID:   "d9a7c76f-dfe4-41c6-9924-82a405613f44",
			},
		},
	}

	flattenedGraph, err := dbRepo.GetFlattenedResourceGraph(authContext, pkg.ResourceGraphTypeMedicalHistory, options)
	require.NoError(suite.T(), err)
	require.NotNil(suite.T(), flattenedGraph)
	//validated using http://clinfhir.com/bundleVisualizer.html

	require.Equal(suite.T(), 1, len(flattenedGraph["Encounter"]))
	require.Equal(suite.T(), 27, len(flattenedGraph["Encounter"][0].RelatedResource))

}

// Bug: the Epic enounter graph was not consistently return the same related resources
func (suite *RepositoryGraphTestSuite) TestGetFlattenedResourceGraph_NDJson() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
	fakeConfig.EXPECT().IsSet("search").Return(false).AnyTimes()
	fakeConfig.EXPECT().GetString("log.level").Return("INFO").AnyTimes()
	dbRepo, err := NewRepository(fakeConfig, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())
	require.NoError(suite.T(), err)

	userModel := &models.User{
		Username: "test_username",
		Password: "testpassword",
		Email:    "test@test.com",
	}
	err = dbRepo.CreateUser(context.Background(), userModel)
	require.NoError(suite.T(), err)
	require.NotEmpty(suite.T(), userModel.ID)
	require.NotEqual(suite.T(), uuid.Nil, userModel.ID)
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	testSourceCredential := models.SourceCredential{
		ModelBase: models.ModelBase{
			ID: uuid.New(),
		},
		UserID:       userModel.ID,
		Patient:      uuid.New().String(),
		PlatformType: sourcePkg.PlatformTypeManual,
	}
	err = dbRepo.CreateSource(authContext, &testSourceCredential)
	require.NoError(suite.T(), err)

	bundleFile, err := os.Open("./testdata/epic_fhircamila.ndjson")
	require.NoError(suite.T(), err)

	testLogger := logrus.WithFields(logrus.Fields{
		"type": "test",
	})

	manualClient, err := sourceFactory.GetSourceClient(sourcePkg.FastenLighthouseEnvSandbox, authContext, testLogger, &testSourceCredential)

	summary, err := manualClient.SyncAllBundle(dbRepo, bundleFile, sourcePkg.FhirVersion401)
	require.NoError(suite.T(), err)
	require.Equal(suite.T(), 58, summary.TotalResources)
	require.Equal(suite.T(), 58, len(summary.UpdatedResources))

	//test
	options := models.ResourceGraphOptions{
		ResourcesIds: []models.OriginBase{
			{
				SourceID:           testSourceCredential.ID,
				SourceResourceType: "Encounter",
				SourceResourceID:   "eGmO0h.1.UQQrExl4bfM7OQ3",
			},
		},
	}

	flattenedGraph, err := dbRepo.GetFlattenedResourceGraph(authContext, pkg.ResourceGraphTypeMedicalHistory, options)
	require.NoError(suite.T(), err)
	require.NotNil(suite.T(), flattenedGraph)
	//validated using http://clinfhir.com/bundleVisualizer.html

	require.Equal(suite.T(), 1, len(flattenedGraph["Encounter"]))
	//REGRESSION: in some cases the flattened graph was not correctly returning 7 related, instead only retuning 1 or 4. Bug in Graph generation

	for ndx, found := range flattenedGraph["Encounter"][0].RelatedResource {
		suite.T().Logf("ndx: %d, found: %s/%s", ndx, found.SourceResourceType, found.SourceResourceID)
	}
	require.Equal(suite.T(), 7, len(flattenedGraph["Encounter"][0].RelatedResource))

}
