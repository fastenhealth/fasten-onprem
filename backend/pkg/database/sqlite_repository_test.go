package database

import (
	"fmt"
	sourceModels "github.com/fastenhealth/fasten-sources/clients/models"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg"
	mock_config "github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config/mock"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/gin-gonic/gin"
	"github.com/golang/mock/gomock"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
	"golang.org/x/net/context"
	"io/ioutil"
	"log"
	"os"
	"testing"
)

func TestSourceCredentialInterface(t *testing.T) {
	t.Parallel()

	repo := new(SqliteRepository)

	//assert
	require.Implements(t, (*sourceModels.DatabaseRepository)(nil), repo, "should implement the DatabaseRepository interface from fasten-sources")
	require.Implements(t, (*DatabaseRepository)(nil), repo, "should implement the DatabaseRepository interface")
}

// Define the suite, and absorb the built-in basic suite
// functionality from testify - including a T() method which
// returns the current testing context
type RepositoryTestSuite struct {
	suite.Suite
	MockCtrl     *gomock.Controller
	TestDatabase *os.File
}

// BeforeTest has a function to be executed right before the test starts and receives the suite and test names as input
func (suite *RepositoryTestSuite) BeforeTest(suiteName, testName string) {
	suite.MockCtrl = gomock.NewController(suite.T())

	dbFile, err := ioutil.TempFile("", fmt.Sprintf("%s.*.db", testName))
	if err != nil {
		log.Fatal(err)
	}
	suite.TestDatabase = dbFile

}

// AfterTest has a function to be executed right after the test finishes and receives the suite and test names as input
func (suite *RepositoryTestSuite) AfterTest(suiteName, testName string) {
	suite.MockCtrl.Finish()
	os.Remove(suite.TestDatabase.Name())
}

// In order for 'go test' to run this suite, we need to create
// a normal test function and pass our suite to suite.Run
func TestRepositoryTestSuite(t *testing.T) {
	suite.Run(t, new(RepositoryTestSuite))

}

func (suite *RepositoryTestSuite) TestNewRepository() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("log.level").Return("INFO").AnyTimes()

	//test
	_, err := NewRepository(fakeConfig, logrus.WithField("test", suite.T().Name()))

	//assert
	require.NoError(suite.T(), err)
}

func (suite *RepositoryTestSuite) TestCreateUser() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("log.level").Return("INFO").AnyTimes()
	dbRepo, err := NewRepository(fakeConfig, logrus.WithField("test", suite.T().Name()))
	require.NoError(suite.T(), err)

	//test
	userModel := &models.User{
		Username: "test_username",
		Password: "testpassword",
		Email:    "test@test.com",
	}
	dbRepo.CreateUser(context.Background(), userModel)

	//assert
	require.NotEmpty(suite.T(), userModel.ID)
}

func (suite *RepositoryTestSuite) TestCreateUser_WithExitingUser_ShouldFail() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("log.level").Return("INFO").AnyTimes()
	dbRepo, err := NewRepository(fakeConfig, logrus.WithField("test", suite.T().Name()))
	require.NoError(suite.T(), err)

	//test
	userModel := &models.User{
		Username: "test_username",
		Password: "testpassword",
		Email:    "test@test.com",
	}
	err = dbRepo.CreateUser(context.Background(), userModel)
	require.NoError(suite.T(), err)

	userModel2 := &models.User{
		Username: "test_username",
		Password: "testpassword",
		Email:    "test@test.com",
	}
	err = dbRepo.CreateUser(context.Background(), userModel2)
	//assert
	require.Error(suite.T(), err)
}

//TODO: ensure user's cannot specify the ID when creating a user.
func (suite *RepositoryTestSuite) TestCreateUser_WithUserProvidedId_ShouldBeReplaced() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("log.level").Return("INFO").AnyTimes()
	dbRepo, err := NewRepository(fakeConfig, logrus.WithField("test", suite.T().Name()))
	require.NoError(suite.T(), err)

	//test
	userProvidedId := uuid.New()
	userModel := &models.User{
		ModelBase: models.ModelBase{
			ID: userProvidedId,
		},
		Username: "test_username",
		Password: "testpassword",
		Email:    "test@test.com",
	}
	dbRepo.CreateUser(context.Background(), userModel)

	//assert
	require.NotEmpty(suite.T(), userModel.ID)
	require.NotEqual(suite.T(), userProvidedId.String(), userModel.ID.String())
}

func (suite *RepositoryTestSuite) TestGetUserByUsername() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("log.level").Return("INFO").AnyTimes()
	dbRepo, err := NewRepository(fakeConfig, logrus.WithField("test", suite.T().Name()))
	require.NoError(suite.T(), err)
	userModel := &models.User{
		Username: "test_username",
		Password: "testpassword",
		Email:    "test@test.com",
	}
	err = dbRepo.CreateUser(context.Background(), userModel)
	require.NoError(suite.T(), err)

	//test
	userModelResult, err := dbRepo.GetUserByUsername(context.Background(), "test_username")

	//assert
	require.NoError(suite.T(), err)
	require.Equal(suite.T(), userModel.ID, userModelResult.ID)
}

func (suite *RepositoryTestSuite) TestGetUserByUsername_WithInvalidUsername() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("log.level").Return("INFO").AnyTimes()
	dbRepo, err := NewRepository(fakeConfig, logrus.WithField("test", suite.T().Name()))
	require.NoError(suite.T(), err)
	userModel := &models.User{
		Username: "test_username",
		Password: "testpassword",
		Email:    "test@test.com",
	}
	err = dbRepo.CreateUser(context.Background(), userModel)
	require.NoError(suite.T(), err)

	//test
	_, err = dbRepo.GetUserByUsername(context.Background(), "userdoesntexist")

	//assert
	require.Error(suite.T(), err)
}

func (suite *RepositoryTestSuite) TestGetCurrentUser_WithContextBackgroundAuthUser() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("log.level").Return("INFO").AnyTimes()
	dbRepo, err := NewRepository(fakeConfig, logrus.WithField("test", suite.T().Name()))
	require.NoError(suite.T(), err)
	userModel := &models.User{
		Username: "test_username",
		Password: "testpassword",
		Email:    "test@test.com",
	}
	err = dbRepo.CreateUser(context.Background(), userModel)
	require.NoError(suite.T(), err)

	//test
	userModelResult := dbRepo.GetCurrentUser(context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username"))

	//assert
	require.NotNil(suite.T(), userModelResult)
	require.Equal(suite.T(), userModelResult.Username, "test_username")
}

func (suite *RepositoryTestSuite) TestGetCurrentUser_WithGinContextBackgroundAuthUser() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("log.level").Return("INFO").AnyTimes()
	dbRepo, err := NewRepository(fakeConfig, logrus.WithField("test", suite.T().Name()))
	require.NoError(suite.T(), err)
	userModel := &models.User{
		Username: "test_username",
		Password: "testpassword",
		Email:    "test@test.com",
	}
	err = dbRepo.CreateUser(context.Background(), userModel)
	require.NoError(suite.T(), err)

	//test
	ginContext := gin.Context{}
	ginContext.Set(pkg.ContextKeyTypeAuthUsername, "test_username")
	userModelResult := dbRepo.GetCurrentUser(&ginContext)

	//assert
	require.NotNil(suite.T(), userModelResult)
	require.Equal(suite.T(), userModelResult.Username, "test_username")
}

func (suite *RepositoryTestSuite) TestGetCurrentUser_WithContextBackgroundAuthUserAndNoUserExists_ShouldThrowError() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("log.level").Return("INFO").AnyTimes()
	dbRepo, err := NewRepository(fakeConfig, logrus.WithField("test", suite.T().Name()))
	require.NoError(suite.T(), err)

	//test
	userModelResult := dbRepo.GetCurrentUser(context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username"))

	//assert
	require.Nil(suite.T(), userModelResult)
}

//TODO - merging multiple Compositions is broken
