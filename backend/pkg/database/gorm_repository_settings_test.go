package database

import (
	"context"
	"fmt"
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
	"io/ioutil"
	"log"
	"os"
	"testing"
)

// Define the suite, and absorb the built-in basic suite
// functionality from testify - including a T() method which
// returns the current testing context
type RepositorySettingsTestSuite struct {
	suite.Suite
	TestDatabase *os.File
	TestConfig   config.Interface

	TestRepository DatabaseRepository
	TestUser       *models.User
}

// BeforeTest has a function to be executed right before the test starts and receives the suite and test names as input
func (suite *RepositorySettingsTestSuite) BeforeTest(suiteName, testName string) {

	dbFile, err := ioutil.TempFile("", fmt.Sprintf("%s.*.db", testName))
	if err != nil {
		log.Fatal(err)
	}
	suite.TestDatabase = dbFile

	testConfig, err := config.Create()
	require.NoError(suite.T(), err)
	testConfig.SetDefault("database.location", suite.TestDatabase.Name())
	testConfig.SetDefault("database.encryption.enabled", false)
	testConfig.SetDefault("log.level", "INFO")
	suite.TestConfig = testConfig

	dbRepo, err := NewRepository(testConfig, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())
	require.NoError(suite.T(), err)
	suite.TestRepository = dbRepo
	userModel := &models.User{
		Username: "test_username",
		Password: "testpassword",
		Email:    "test@test.com",
	}
	err = suite.TestRepository.CreateUser(context.Background(), userModel)
	suite.TestUser = userModel
	require.NoError(suite.T(), err)

}

// AfterTest has a function to be executed right after the test finishes and receives the suite and test names as input
func (suite *RepositorySettingsTestSuite) AfterTest(suiteName, testName string) {
	os.Remove(suite.TestDatabase.Name())
}

// In order for 'go test' to run this suite, we need to create
// a normal test function and pass our suite to suite.Run
func TestRepositorySettingsTestSuite(t *testing.T) {
	suite.Run(t, new(RepositorySettingsTestSuite))

}

func (suite *RepositorySettingsTestSuite) TestLoadUserSettings() {
	//setup
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	//test
	userSettings, err := suite.TestRepository.LoadUserSettings(authContext)
	require.NoError(suite.T(), err)

	//assert
	require.Equal(suite.T(), userSettings, &models.UserSettings{
		DashboardLocations: []string{},
	})
}

func (suite *RepositorySettingsTestSuite) TestSaveUserSettings() {
	//setup
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	//test
	err := suite.TestRepository.SaveUserSettings(authContext, &models.UserSettings{
		DashboardLocations: []string{"https://gist.github.com/AnalogJ/a56ded05cc6766b377268f14719cb84d"},
	})
	require.NoError(suite.T(), err)
	userSettings, err := suite.TestRepository.LoadUserSettings(authContext)
	require.NoError(suite.T(), err)

	//assert
	require.Equal(suite.T(), userSettings, &models.UserSettings{
		DashboardLocations: []string{
			"https://gist.github.com/AnalogJ/a56ded05cc6766b377268f14719cb84d",
		},
	})
}
