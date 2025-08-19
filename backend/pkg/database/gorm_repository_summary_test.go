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
type RepositorySummaryTestSuite struct {
	suite.Suite
	MockCtrl     *gomock.Controller
	TestDatabase *os.File
}

// BeforeTest has a function to be executed right before the test starts and receives the suite and test names as input
func (suite *RepositorySummaryTestSuite) BeforeTest(suiteName, testName string) {
	suite.MockCtrl = gomock.NewController(suite.T())

	dbFile, err := ioutil.TempFile("", fmt.Sprintf("%s.*.db", testName))
	if err != nil {
		log.Fatal(err)
	}
	suite.TestDatabase = dbFile

}

// AfterTest has a function to be executed right after the test finishes and receives the suite and test names as input
func (suite *RepositorySummaryTestSuite) AfterTest(suiteName, testName string) {
	suite.MockCtrl.Finish()
	os.Remove(suite.TestDatabase.Name())
	os.Remove(suite.TestDatabase.Name() + "-shm")
	os.Remove(suite.TestDatabase.Name() + "-wal")
}

// In order for 'go test' to run this suite, we need to create
// a normal test function and pass our suite to suite.Run
func TestRepositorySummaryTestSuiteSuite(t *testing.T) {
	suite.Run(t, new(RepositorySummaryTestSuite))
}

func (suite *RepositorySummaryTestSuite) TestGetInternationalPatientSummaryBundle() {
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

	bundleFile, err := os.Open("./testdata/Britt177_Blick895_ad0f0573-f8c7-4704-9eef-50342d37ef50.json")
	require.NoError(suite.T(), err)

	testLogger := logrus.WithFields(logrus.Fields{
		"type": "test",
	})

	manualClient, err := sourceFactory.GetSourceClient(sourcePkg.FastenLighthouseEnvSandbox, authContext, testLogger, &testSourceCredential)
	require.NoError(suite.T(), err)

	summary, err := manualClient.SyncAllBundle(dbRepo, bundleFile, sourcePkg.FhirVersion401)
	require.NoError(suite.T(), err)
	require.Equal(suite.T(), 72, summary.TotalResources)
	require.Equal(suite.T(), 80, len(summary.UpdatedResources))

	//test
	ipsData, err := dbRepo.GetInternationalPatientSummaryExport(authContext)
	require.NoError(suite.T(), err)

	//case bundle and composition
	fhirBundle := ipsData.Bundle
	fhirComposition := ipsData.Composition

	require.NotNil(suite.T(), fhirBundle)
	require.NotNil(suite.T(), fhirComposition)

	require.Equal(suite.T(), 14, len(fhirComposition.Section))

	// Medication Summary
	require.Equal(suite.T(), 0, len(fhirComposition.Section[0].Entry))
	require.NotNil(suite.T(), fhirComposition.Section[0].EmptyReason)

	// Allergies and Intolerances
	require.Equal(suite.T(), 0, len(fhirComposition.Section[1].Entry))
	require.NotNil(suite.T(), fhirComposition.Section[1].EmptyReason)

	// Problem List
	require.Equal(suite.T(), 1, len(fhirComposition.Section[2].Entry))
	require.Nil(suite.T(), fhirComposition.Section[2].EmptyReason)

	// Immunizations
	require.Equal(suite.T(), 6, len(fhirComposition.Section[3].Entry))
	require.Nil(suite.T(), fhirComposition.Section[3].EmptyReason)

	// History of Procedures
	require.Equal(suite.T(), 3, len(fhirComposition.Section[4].Entry))
	require.Nil(suite.T(), fhirComposition.Section[4].EmptyReason)

	// Medical Devices
	require.Equal(suite.T(), 0, len(fhirComposition.Section[5].Entry))
	require.NotNil(suite.T(), fhirComposition.Section[5].EmptyReason)

	// Diagnostic Results
	require.Equal(suite.T(), 12, len(fhirComposition.Section[6].Entry))
	require.Nil(suite.T(), fhirComposition.Section[6].EmptyReason)

	// Vital Signs
	require.Equal(suite.T(), 15, len(fhirComposition.Section[7].Entry))
	require.Nil(suite.T(), fhirComposition.Section[7].EmptyReason)

	// Past History of Illness
	require.Equal(suite.T(), 1, len(fhirComposition.Section[8].Entry))
	require.Nil(suite.T(), fhirComposition.Section[8].EmptyReason)

	// Pregnancy History
	require.Equal(suite.T(), 0, len(fhirComposition.Section[9].Entry))
	require.NotNil(suite.T(), fhirComposition.Section[9].EmptyReason)

	// Social History
	require.Equal(suite.T(), 0, len(fhirComposition.Section[10].Entry))
	require.NotNil(suite.T(), fhirComposition.Section[10].EmptyReason)

	// Plan of Care
	require.Equal(suite.T(), 0, len(fhirComposition.Section[11].Entry))
	require.NotNil(suite.T(), fhirComposition.Section[11].EmptyReason)

	// Functional Status
	require.Equal(suite.T(), 0, len(fhirComposition.Section[12].Entry))
	require.NotNil(suite.T(), fhirComposition.Section[12].EmptyReason)

	// Advance Directives
	require.Equal(suite.T(), 0, len(fhirComposition.Section[13].Entry))
	require.NotNil(suite.T(), fhirComposition.Section[13].EmptyReason)
}
