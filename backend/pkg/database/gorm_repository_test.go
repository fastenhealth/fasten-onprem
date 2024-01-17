package database

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	mock_config "github.com/fastenhealth/fasten-onprem/backend/pkg/config/mock"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	sourceModels "github.com/fastenhealth/fasten-sources/clients/models"
	sourcePkg "github.com/fastenhealth/fasten-sources/pkg"
	"github.com/fastenhealth/gofhir-models/fhir401"
	fhirutils "github.com/fastenhealth/gofhir-models/fhir401/utils"
	"github.com/gin-gonic/gin"
	"github.com/golang/mock/gomock"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
	"golang.org/x/net/context"
)

func TestSourceCredentialInterface(t *testing.T) {
	t.Parallel()

	repo := new(GormRepository)

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
	//os.Remove(suite.TestDatabase.Name())
	//os.Remove(suite.TestDatabase.Name() + "-shm")
	//os.Remove(suite.TestDatabase.Name() + "-wal")
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
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
	fakeConfig.EXPECT().GetString("log.level").Return("INFO").AnyTimes()

	//test
	_, err := NewRepository(fakeConfig, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())

	//assert
	require.NoError(suite.T(), err)
}

func (suite *RepositoryTestSuite) TestCreateUser() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
	fakeConfig.EXPECT().GetString("log.level").Return("INFO").AnyTimes()
	dbRepo, err := NewRepository(fakeConfig, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())
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
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
	fakeConfig.EXPECT().GetString("log.level").Return("INFO").AnyTimes()
	dbRepo, err := NewRepository(fakeConfig, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())
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

// TODO: ensure user's cannot specify the ID when creating a user.
func (suite *RepositoryTestSuite) TestCreateUser_WithUserProvidedId_ShouldBeReplaced() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
	fakeConfig.EXPECT().GetString("log.level").Return("INFO").AnyTimes()
	dbRepo, err := NewRepository(fakeConfig, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())
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
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
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
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
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

	//test
	_, err = dbRepo.GetUserByUsername(context.Background(), "userdoesntexist")

	//assert
	require.Error(suite.T(), err)
}

func (suite *RepositoryTestSuite) TestGetCurrentUser_WithContextBackgroundAuthUser() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
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

	//test
	userModelResult, err := dbRepo.GetCurrentUser(context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username"))

	//assert
	require.NoError(suite.T(), err)
	require.NotNil(suite.T(), userModelResult)
	require.Equal(suite.T(), userModelResult.Username, "test_username")
}

func (suite *RepositoryTestSuite) TestGetCurrentUser_WithGinContextBackgroundAuthUser() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
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

	//test
	//ginContext := gin.Context{}
	w := httptest.NewRecorder()
	ginContext, _ := gin.CreateTestContext(w)
	ginContext.Set(pkg.ContextKeyTypeAuthUsername, "test_username")
	userModelResult, err := dbRepo.GetCurrentUser(ginContext)

	//assert
	require.NoError(suite.T(), err)
	require.NotNil(suite.T(), userModelResult)
	require.Equal(suite.T(), userModelResult.Username, "test_username")
}

func (suite *RepositoryTestSuite) TestGetCurrentUser_WithContextBackgroundAuthUserAndNoUserExists_ShouldThrowError() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
	fakeConfig.EXPECT().GetString("log.level").Return("INFO").AnyTimes()
	dbRepo, err := NewRepository(fakeConfig, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())
	require.NoError(suite.T(), err)

	//test
	userModelResult, err := dbRepo.GetCurrentUser(context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username"))

	//assert
	require.Error(suite.T(), err)
	require.Nil(suite.T(), userModelResult)
}

func (suite *RepositoryTestSuite) TestCreateGlossaryEntry() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
	fakeConfig.EXPECT().GetString("log.level").Return("INFO").AnyTimes()
	dbRepo, err := NewRepository(fakeConfig, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())
	require.NoError(suite.T(), err)

	//test
	glossaryEntry := &models.Glossary{
		Code:       "49727002",
		CodeSystem: "2.16.840.1.113883.6.96",
		Publisher:  "U.S. National Library of Medicine",
		Title:      "Cough",
		Url:        "https://medlineplus.gov/cough.html?utm_source=mplusconnect&utm_medium=service",
		Description: `<p>Coughing is a reflex that keeps your throat and airways clear.  Although it can be annoying, coughing helps your body heal or protect itself. Coughs can be either acute or chronic.  Acute coughs begin suddenly and usually last no more than 2 to 3 weeks.  Acute coughs are the kind you most often get with a <a href="https://medlineplus.gov/commoncold.html?utm_source=mplusconnect">cold</a>, <a href="https://medlineplus.gov/flu.html?utm_source=mplusconnect">flu</a>, or <a href="https://medlineplus.gov/acutebronchitis.html?utm_source=mplusconnect">acute bronchitis</a>.  Chronic coughs last longer than 2 to 3 weeks.  Causes of chronic cough include:</p><ul>
<li><a href="https://medlineplus.gov/chronicbronchitis.html?utm_source=mplusconnect">Chronic bronchitis</a></li>
<li><a href="https://medlineplus.gov/asthma.html?utm_source=mplusconnect">Asthma</a></li>
<li><a href="https://medlineplus.gov/allergy.html?utm_source=mplusconnect">Allergies</a></li>
<li><a href="https://medlineplus.gov/copd.html?utm_source=mplusconnect">COPD</a> (chronic obstructive pulmonary disease)</li>
<li><a href="https://medlineplus.gov/gerd.html?utm_source=mplusconnect">GERD</a> (gastroesophageal reflux disease) </li>
<li><a href="https://medlineplus.gov/smoking.html?utm_source=mplusconnect">Smoking</a></li>
<li><a href="https://medlineplus.gov/throatdisorders.html?utm_source=mplusconnect">Throat disorders</a>, such as <a href="https://medlineplus.gov/croup.html?utm_source=mplusconnect">croup</a> in young children</li>
<li>Some medicines </li>
</ul>

<p>Water can help ease your cough - whether you drink it or add it to the air with a steamy shower or vaporizer. If you have a cold or the flu, antihistamines may work better than non-prescription <a href="https://medlineplus.gov/coldandcoughmedicines.html?utm_source=mplusconnect">cough medicines</a>.   Children under four should not have cough medicine.  For children over four, use caution and read labels carefully.</p>`,
	}
	err = dbRepo.CreateGlossaryEntry(context.Background(), glossaryEntry)

	//assert
	require.NoError(suite.T(), err)
	require.NotEmpty(suite.T(), glossaryEntry.ID)
}

func (suite *RepositoryTestSuite) TestUpsertRawResource() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
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
	testSourceCredential := models.SourceCredential{
		ModelBase: models.ModelBase{
			ID: uuid.New(),
		},
		UserID: userModel.ID,
	}
	testPatientData, err := os.ReadFile("./testdata/Abraham100_Heller342_Patient.json")
	require.NoError(suite.T(), err)

	//test
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")
	wasCreated, err := dbRepo.UpsertRawResource(
		authContext,
		&testSourceCredential,
		sourceModels.RawResourceFhir{
			SourceResourceType: "Patient",
			SourceResourceID:   "b426b062-8273-4b93-a907-de3176c0567d",
			ResourceRaw:        testPatientData,
		},
	)
	require.NoError(suite.T(), err)
	foundPatientResource, err := dbRepo.GetResourceByResourceTypeAndId(authContext, "Patient", "b426b062-8273-4b93-a907-de3176c0567d")

	//assert
	require.NoError(suite.T(), err)
	require.True(suite.T(), wasCreated)
	require.NotNil(suite.T(), foundPatientResource)
	require.Equal(suite.T(), foundPatientResource.SourceID, testSourceCredential.ID)

	//ensure that the raw resource data is the same (we don't want to modify the data)
	var expectedPationData map[string]interface{}
	err = json.Unmarshal(testPatientData, &expectedPationData)
	require.NoError(suite.T(), err)

	var actualPatientData map[string]interface{}
	err = json.Unmarshal(foundPatientResource.ResourceRaw, &actualPatientData)
	require.Equal(suite.T(), expectedPationData, actualPatientData)
}

//TODO create UPSERT test, where the resource already exists and we need to update it

func (suite *RepositoryTestSuite) TestUpsertRawResource_WithRelatedResourceAndDuplicateReference() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
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
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	testSourceCredential := models.SourceCredential{
		ModelBase: models.ModelBase{
			ID: uuid.New(),
		},
		UserID: userModel.ID,
	}
	patientData, err := os.ReadFile("./testdata/Abraham100_Heller342_Patient.json")
	require.NoError(suite.T(), err)

	//test
	wasCreated, err := dbRepo.UpsertRawResource(
		context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username"),
		&testSourceCredential,
		sourceModels.RawResourceFhir{
			SourceResourceType:  "Patient",
			SourceResourceID:    "b426b062-8273-4b93-a907-de3176c0567d",
			ResourceRaw:         patientData,
			ReferencedResources: []string{"Observation/1", "Observation/2", "Observation/3", "Observation/3"}, //duplicate resource reference should not cause an issue, it should be silently ignored
		},
	)

	//assert
	require.NoError(suite.T(), err)
	require.True(suite.T(), wasCreated)
	relatedResource, err := dbRepo.FindResourceAssociationsByTypeAndId(authContext, &testSourceCredential, "Patient", "b426b062-8273-4b93-a907-de3176c0567d")
	require.NoError(suite.T(), err)
	require.Equal(suite.T(), 3, len(relatedResource))

}

func (suite *RepositoryTestSuite) TestListResources() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
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
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	otherUserModel := &models.User{
		Username: "test_other_username",
		Password: "testpassword",
		Email:    "testother@test.com",
	}
	err = dbRepo.CreateUser(context.Background(), otherUserModel)
	require.NoError(suite.T(), err)

	testSource1Credential := models.SourceCredential{
		ModelBase: models.ModelBase{
			ID: uuid.New(),
		},
		UserID: userModel.ID,
	}
	testSource2Credential := models.SourceCredential{
		ModelBase: models.ModelBase{
			ID: uuid.New(),
		},
		UserID: userModel.ID,
	}
	patientDataAbraham100, err := os.ReadFile("./testdata/Abraham100_Heller342_Patient.json")
	require.NoError(suite.T(), err)

	testResource1Created, err := dbRepo.UpsertRawResource(
		context.WithValue(authContext, pkg.ContextKeyTypeAuthUsername, "test_username"),
		&testSource1Credential,
		sourceModels.RawResourceFhir{
			SourceResourceType:  "Patient",
			SourceResourceID:    "b426b062-8273-4b93-a907-de3176c0567d",
			ResourceRaw:         patientDataAbraham100,
			ReferencedResources: []string{"Observation/1", "Observation/2", "Observation/3", "Observation/3"}, //duplicate resource reference should not cause an issue, it should be silently ignored
		},
	)
	require.NoError(suite.T(), err)
	require.True(suite.T(), testResource1Created)

	patientDataLillia547, err := os.ReadFile("./testdata/Lillia547_Schneider99_Patient.json")
	require.NoError(suite.T(), err)
	testResource2Created, err := dbRepo.UpsertRawResource(
		context.WithValue(authContext, pkg.ContextKeyTypeAuthUsername, "test_username"),
		&testSource2Credential,
		sourceModels.RawResourceFhir{
			SourceResourceType:  "Patient",
			SourceResourceID:    "d3fbfb3a-7b8d-45c0-13b4-9666e4d36a3e",
			ResourceRaw:         patientDataLillia547,
			ReferencedResources: []string{"Observation/10", "Observation/20", "Observation/30"},
		},
	)
	require.NoError(suite.T(), err)
	require.True(suite.T(), testResource2Created)

	//test
	foundPatientResources, err := dbRepo.ListResources(authContext, models.ListResourceQueryOptions{
		SourceResourceType: "Patient",
	})
	require.NoError(suite.T(), err)

	findAllResources, err := dbRepo.ListResources(authContext, models.ListResourceQueryOptions{})
	require.NoError(suite.T(), err)

	findSourceResources, err := dbRepo.ListResources(authContext, models.ListResourceQueryOptions{SourceID: testSource1Credential.ID.String()})
	require.NoError(suite.T(), err)

	//find specific resource
	findSpecificResource, err := dbRepo.ListResources(authContext, models.ListResourceQueryOptions{SourceResourceID: "d3fbfb3a-7b8d-45c0-13b4-9666e4d36a3e", SourceResourceType: "Patient"})
	require.NoError(suite.T(), err)

	findInvalidResource, err := dbRepo.ListResources(authContext, models.ListResourceQueryOptions{SourceResourceID: "11111111-7b8d-45c0-13b4-9666e4d36a3e", SourceResourceType: "Patient"})
	require.NoError(suite.T(), err)

	findResourceWithOtherUserId, err := dbRepo.ListResources(context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_other_username"), models.ListResourceQueryOptions{SourceResourceID: "d3fbfb3a-7b8d-45c0-13b4-9666e4d36a3e", SourceResourceType: "Patient"})
	require.NoError(suite.T(), err)

	_, err = dbRepo.ListResources(context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "doesnt_exist"), models.ListResourceQueryOptions{SourceResourceID: "d3fbfb3a-7b8d-45c0-13b4-9666e4d36a3e", SourceResourceType: "Patient"})
	require.Error(suite.T(), err)

	//assert
	require.Equal(suite.T(), len(foundPatientResources), 2)
	require.Equal(suite.T(), len(findAllResources), 2)
	require.Equal(suite.T(), len(findSourceResources), 1)
	require.Equal(suite.T(), len(findSpecificResource), 1)
	require.Equal(suite.T(), len(findInvalidResource), 0)
	require.Equal(suite.T(), len(findResourceWithOtherUserId), 0)
}

func (suite *RepositoryTestSuite) TestGetResourceByResourceTypeAndId() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
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
	testSourceCredential := models.SourceCredential{
		ModelBase: models.ModelBase{
			ID: uuid.New(),
		},
		UserID: userModel.ID,
	}
	testPatientData, err := os.ReadFile("./testdata/Abraham100_Heller342_Patient.json")
	require.NoError(suite.T(), err)

	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")
	wasCreated, err := dbRepo.UpsertRawResource(
		authContext,
		&testSourceCredential,
		sourceModels.RawResourceFhir{
			SourceResourceType: "Patient",
			SourceResourceID:   "b426b062-8273-4b93-a907-de3176c0567d",
			ResourceRaw:        testPatientData,
		},
	)
	require.NoError(suite.T(), err)
	require.True(suite.T(), wasCreated)

	//test & assert
	findPatientResource, err := dbRepo.GetResourceByResourceTypeAndId(authContext, "Patient", "b426b062-8273-4b93-a907-de3176c0567d")
	require.NoError(suite.T(), err)
	require.NotNil(suite.T(), findPatientResource)

	//raise an error if the resource is not found (invalid resource type or id missing)
	_, err = dbRepo.GetResourceByResourceTypeAndId(authContext, "Patient", "11111111-8273-4b93-a907-de3176c0567d")
	require.Error(suite.T(), err)

	_, err = dbRepo.GetResourceByResourceTypeAndId(authContext, "Observation", "b426b062-8273-4b93-a907-de3176c0567d")
	require.Error(suite.T(), err)

	_, err = dbRepo.GetResourceByResourceTypeAndId(authContext, "InvalidResource", "b426b062-8273-4b93-a907-de3176c0567d")
	require.Error(suite.T(), err)
}

func (suite *RepositoryTestSuite) TestGetResourceBySourceId() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
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
	testSourceCredential := models.SourceCredential{
		ModelBase: models.ModelBase{
			ID: uuid.New(),
		},
		UserID: userModel.ID,
	}
	testPatientData, err := os.ReadFile("./testdata/Abraham100_Heller342_Patient.json")
	require.NoError(suite.T(), err)

	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")
	wasCreated, err := dbRepo.UpsertRawResource(
		authContext,
		&testSourceCredential,
		sourceModels.RawResourceFhir{
			SourceResourceType: "Patient",
			SourceResourceID:   "b426b062-8273-4b93-a907-de3176c0567d",
			ResourceRaw:        testPatientData,
		},
	)
	require.NoError(suite.T(), err)
	require.True(suite.T(), wasCreated)

	//test & assert
	findPatientResource, err := dbRepo.GetResourceBySourceId(authContext, testSourceCredential.ID.String(), "b426b062-8273-4b93-a907-de3176c0567d")
	require.NoError(suite.T(), err)
	require.NotNil(suite.T(), findPatientResource)

	//raise an error if the resource is not found (invalid resource id for source)
	_, err = dbRepo.GetResourceByResourceTypeAndId(authContext, testSourceCredential.ID.String(), "11111111-8273-4b93-a907-de3176c0567d")
	require.Error(suite.T(), err)

	_, err = dbRepo.GetResourceByResourceTypeAndId(authContext, uuid.NewString(), "b426b062-8273-4b93-a907-de3176c0567d")
	require.Error(suite.T(), err)

	_, err = dbRepo.GetResourceByResourceTypeAndId(authContext, testSourceCredential.ID.String(), "")
	require.Error(suite.T(), err)
}

func (suite *RepositoryTestSuite) TestGetPatientForSources() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
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
	testSourceCredential := models.SourceCredential{
		ModelBase: models.ModelBase{
			ID: uuid.New(),
		},
		UserID: userModel.ID,
	}
	testPatientData, err := os.ReadFile("./testdata/Abraham100_Heller342_Patient.json")
	require.NoError(suite.T(), err)

	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")
	wasCreated, err := dbRepo.UpsertRawResource(
		authContext,
		&testSourceCredential,
		sourceModels.RawResourceFhir{
			SourceResourceType: "Patient",
			SourceResourceID:   "b426b062-8273-4b93-a907-de3176c0567d",
			ResourceRaw:        testPatientData,
		},
	)
	require.NoError(suite.T(), err)
	require.True(suite.T(), wasCreated)

	was2Created, err := dbRepo.UpsertRawResource(
		authContext,
		&testSourceCredential,
		sourceModels.RawResourceFhir{
			SourceResourceType: "Patient",
			SourceResourceID:   "11111111-8273-4b93-a907-de3176c0567d",
			ResourceRaw:        testPatientData,
		},
	)
	require.NoError(suite.T(), err)
	require.True(suite.T(), was2Created)
	//test & assert
	findPatients, err := dbRepo.GetPatientForSources(authContext)
	require.NoError(suite.T(), err)
	require.NotNil(suite.T(), findPatients)
	require.Len(suite.T(), findPatients, 2) //TODO: this may need to change to 1 if we group by source_id

}

func (suite *RepositoryTestSuite) TestAddResourceAssociation() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
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
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	testSourceCredential := models.SourceCredential{
		ModelBase: models.ModelBase{
			ID: uuid.New(),
		},
		UserID: userModel.ID,
	}

	//test
	err = dbRepo.AddResourceAssociation(authContext,
		&testSourceCredential, "Patient", "b426b062-8273-4b93-a907-de3176c0567d",
		&testSourceCredential, "Observation", "11111111-8273-4b93-a907-de3176c0567d")
	require.NoError(suite.T(), err)

	//assert
	related, err := dbRepo.FindResourceAssociationsByTypeAndId(authContext, &testSourceCredential, "Patient", "b426b062-8273-4b93-a907-de3176c0567d")
	require.NoError(suite.T(), err)
	require.Equal(suite.T(), 1, len(related))
}

func (suite *RepositoryTestSuite) TestAddResourceAssociation_WithMismatchingSourceIds() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
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
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	//test 1 - user id does not match the user id on resources (but they match eachother)
	differentUserIdSourceCredential := models.SourceCredential{
		ModelBase: models.ModelBase{
			ID: uuid.New(),
		},
		UserID: uuid.New(),
	}
	errForUserMismatch := dbRepo.AddResourceAssociation(authContext,
		&differentUserIdSourceCredential, "Patient", "b426b062-8273-4b93-a907-de3176c0567d",
		&differentUserIdSourceCredential, "Observation", "11111111-8273-4b93-a907-de3176c0567d")
	require.Error(suite.T(), errForUserMismatch)

	//test 2 - user id for resources do not match eachother
	sourceCredential1 := models.SourceCredential{
		ModelBase: models.ModelBase{
			ID: uuid.New(),
		},
		UserID: uuid.New(),
	}
	sourceCredential2 := models.SourceCredential{
		ModelBase: models.ModelBase{
			ID: uuid.New(),
		},
		UserID: uuid.New(),
	}
	require.NotEqual(suite.T(), sourceCredential1.UserID, sourceCredential2.UserID)
	errForResourceMismatch := dbRepo.AddResourceAssociation(authContext,
		&sourceCredential1, "Patient", "b426b062-8273-4b93-a907-de3176c0567d",
		&sourceCredential2, "Observation", "11111111-8273-4b93-a907-de3176c0567d")
	require.Error(suite.T(), errForResourceMismatch)
}

func (suite *RepositoryTestSuite) TestRemoveResourceAssociation() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
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
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	testSourceCredential := models.SourceCredential{
		ModelBase: models.ModelBase{
			ID: uuid.New(),
		},
		UserID: userModel.ID,
	}

	err = dbRepo.AddResourceAssociation(authContext,
		&testSourceCredential, "Patient", "b426b062-8273-4b93-a907-de3176c0567d",
		&testSourceCredential, "Observation", "11111111-8273-4b93-a907-de3176c0567d")
	require.NoError(suite.T(), err)

	//test
	errWhenNotExists := dbRepo.RemoveResourceAssociation(authContext,
		&testSourceCredential, "Patient", "999999999-8273-4b93-a907-de3176c0567d",
		&testSourceCredential, "Observation", "11111111-8273-4b93-a907-de3176c0567d")
	require.Errorf(suite.T(), errWhenNotExists, "association should not exist, so deletion should fail")

	err = dbRepo.RemoveResourceAssociation(authContext,
		&testSourceCredential, "Patient", "b426b062-8273-4b93-a907-de3176c0567d",
		&testSourceCredential, "Observation", "11111111-8273-4b93-a907-de3176c0567d")
	require.NoError(suite.T(), err)
}

func (suite *RepositoryTestSuite) TestGetSourceSummary() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
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
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	testSourceCredential := models.SourceCredential{
		ModelBase: models.ModelBase{
			ID: uuid.New(),
		},
		UserID: userModel.ID,
	}
	err = dbRepo.CreateSource(authContext, &testSourceCredential)
	require.NoError(suite.T(), err)

	testPatientData, err := os.ReadFile("./testdata/Abraham100_Heller342_262b819a-5193-404a-9787-b7f599358035.json")
	require.NoError(suite.T(), err)

	var testPatientBundle fhir401.Bundle
	err = json.Unmarshal(testPatientData, &testPatientBundle)
	require.NoError(suite.T(), err)

	for _, resourceEntry := range testPatientBundle.Entry {

		fhirResource, _ := fhirutils.MapToResource(resourceEntry.Resource, false)
		resourceType, resourceId := fhirResource.(sourceModels.ResourceInterface).ResourceRef()
		if resourceId == nil {
			suite.T().Logf("skipping resource with no ID: %s", resourceType)
			continue //skip resources missing an ID
		}
		wasCreated, err := dbRepo.UpsertRawResource(
			authContext,
			&testSourceCredential,
			sourceModels.RawResourceFhir{
				SourceResourceType: resourceType,
				SourceResourceID:   *resourceId,
				ResourceRaw:        resourceEntry.Resource,
			},
		)
		require.NoError(suite.T(), err)
		require.True(suite.T(), wasCreated)
	}

	//test
	sourceSummary, err := dbRepo.GetSourceSummary(authContext, testSourceCredential.ID.String())
	require.NoError(suite.T(), err)
	require.NotNil(suite.T(), sourceSummary)
	//validated using https://www.maxmddirect.com/direct/FHIR/ResponseViewer
	require.Equal(suite.T(), []map[string]interface{}{
		{"count": int64(1), "resource_type": "CarePlan", "source_id": testSourceCredential.ID.String()},
		{"count": int64(1), "resource_type": "CareTeam", "source_id": testSourceCredential.ID.String()},
		{"count": int64(22), "resource_type": "Claim", "source_id": testSourceCredential.ID.String()},
		{"count": int64(8), "resource_type": "Condition", "source_id": testSourceCredential.ID.String()},
		{"count": int64(2), "resource_type": "DiagnosticReport", "source_id": testSourceCredential.ID.String()},
		{"count": int64(18), "resource_type": "Encounter", "source_id": testSourceCredential.ID.String()},
		{"count": int64(18), "resource_type": "ExplanationOfBenefit", "source_id": testSourceCredential.ID.String()},
		{"count": int64(16), "resource_type": "Immunization", "source_id": testSourceCredential.ID.String()},
		{"count": int64(4), "resource_type": "MedicationRequest", "source_id": testSourceCredential.ID.String()},
		{"count": int64(93), "resource_type": "Observation", "source_id": testSourceCredential.ID.String()},
		{"count": int64(3), "resource_type": "Organization", "source_id": testSourceCredential.ID.String()},
		{"count": int64(1), "resource_type": "Patient", "source_id": testSourceCredential.ID.String()},
		{"count": int64(3), "resource_type": "Practitioner", "source_id": testSourceCredential.ID.String()},
		{"count": int64(8), "resource_type": "Procedure", "source_id": testSourceCredential.ID.String()},
	}, sourceSummary.ResourceTypeCounts)
	require.Equal(suite.T(), "b426b062-8273-4b93-a907-de3176c0567d", sourceSummary.Patient.SourceResourceID)
	require.Equal(suite.T(), "Patient", sourceSummary.Patient.SourceResourceType)
	require.NotEmpty(suite.T(), sourceSummary.Patient.ResourceRaw)
}

func (suite *RepositoryTestSuite) TestGetSummary() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
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
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	testSourceCredential1 := models.SourceCredential{
		ModelBase: models.ModelBase{
			ID: uuid.New(),
		},
		UserID:  userModel.ID,
		Patient: uuid.New().String(),
	}
	err = dbRepo.CreateSource(authContext, &testSourceCredential1)
	require.NoError(suite.T(), err)

	testSourceCredential2 := models.SourceCredential{
		ModelBase: models.ModelBase{
			ID: uuid.New(),
		},
		UserID:  userModel.ID,
		Patient: uuid.New().String(),
	}
	err = dbRepo.CreateSource(authContext, &testSourceCredential2)
	require.NoError(suite.T(), err)

	testPatientData, err := os.ReadFile("./testdata/Abraham100_Heller342_262b819a-5193-404a-9787-b7f599358035.json")
	require.NoError(suite.T(), err)

	var testPatientBundle fhir401.Bundle
	err = json.Unmarshal(testPatientData, &testPatientBundle)
	require.NoError(suite.T(), err)

	for _, resourceEntry := range testPatientBundle.Entry {

		fhirResource, _ := fhirutils.MapToResource(resourceEntry.Resource, false)
		resourceType, resourceId := fhirResource.(sourceModels.ResourceInterface).ResourceRef()
		if resourceId == nil {
			suite.T().Logf("skipping resource with no ID: %s", resourceType)
			continue //skip resources missing an ID
		}
		wasCreated, err := dbRepo.UpsertRawResource(
			authContext,
			&testSourceCredential1,
			sourceModels.RawResourceFhir{
				SourceResourceType: resourceType,
				SourceResourceID:   *resourceId,
				ResourceRaw:        resourceEntry.Resource,
			},
		)
		require.NoError(suite.T(), err)
		require.True(suite.T(), wasCreated)

		wasCreated2, err2 := dbRepo.UpsertRawResource(
			authContext,
			&testSourceCredential2,
			sourceModels.RawResourceFhir{
				SourceResourceType: resourceType,
				SourceResourceID:   *resourceId + "2",
				ResourceRaw:        resourceEntry.Resource,
			},
		)
		require.NoError(suite.T(), err2)
		require.True(suite.T(), wasCreated2)
	}

	//test
	sourceSummary, err := dbRepo.GetSummary(authContext)
	require.NoError(suite.T(), err)
	require.NotNil(suite.T(), sourceSummary)
	//validated using https://www.maxmddirect.com/direct/FHIR/ResponseViewer
	require.Equal(suite.T(), []map[string]interface{}{
		{"count": int64(2), "resource_type": "CarePlan"},
		{"count": int64(2), "resource_type": "CareTeam"},
		{"count": int64(44), "resource_type": "Claim"},
		{"count": int64(16), "resource_type": "Condition"},
		{"count": int64(4), "resource_type": "DiagnosticReport"},
		{"count": int64(36), "resource_type": "Encounter"},
		{"count": int64(36), "resource_type": "ExplanationOfBenefit"},
		{"count": int64(32), "resource_type": "Immunization"},
		{"count": int64(8), "resource_type": "MedicationRequest"},
		{"count": int64(93 * 2), "resource_type": "Observation"},
		{"count": int64(6), "resource_type": "Organization"},
		{"count": int64(2), "resource_type": "Patient"},
		{"count": int64(6), "resource_type": "Practitioner"},
		{"count": int64(16), "resource_type": "Procedure"},
	}, sourceSummary.ResourceTypeCounts)

	require.Equal(suite.T(), 3, len(sourceSummary.Sources))
	require.Equal(suite.T(), 2, len(sourceSummary.Patients))
}

func (suite *RepositoryTestSuite) TestAddResourceComposition() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
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
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	testSourceCredential := models.SourceCredential{
		ModelBase: models.ModelBase{
			ID: uuid.New(),
		},
		UserID:  userModel.ID,
		Patient: uuid.New().String(),
	}
	err = dbRepo.CreateSource(authContext, &testSourceCredential)
	require.NoError(suite.T(), err)

	//test
	testCompositionData, err := os.ReadFile("./testdata/Composition_Create.json")
	require.NoError(suite.T(), err)

	type CompositionPayload struct {
		Title     string                 `json:"title"`
		Resources []*models.ResourceBase `json:"resources"`
	}
	var compositionPayload CompositionPayload
	err = json.Unmarshal(testCompositionData, &compositionPayload)
	require.NoError(suite.T(), err)

	//update resources with testSource Credential
	for i, _ := range compositionPayload.Resources {
		compositionPayload.Resources[i].SourceID = testSourceCredential.ID
	}
	err = dbRepo.AddResourceComposition(authContext, compositionPayload.Title, compositionPayload.Resources)
	require.NoError(suite.T(), err)

	//assert
	//check that composition was created
	compositions, err := dbRepo.ListResources(authContext, models.ListResourceQueryOptions{
		SourceID:           "00000000-0000-0000-0000-000000000000",
		SourceResourceType: "Composition",
	})
	require.NoError(suite.T(), err)
	require.Equal(suite.T(), 1, len(compositions))

	//assert that the associations were created
	associations, err := dbRepo.FindResourceAssociationsByTypeAndId(authContext,
		&models.SourceCredential{UserID: userModel.ID, ModelBase: models.ModelBase{ID: uuid.MustParse("00000000-0000-0000-0000-000000000000")}}, //Compositions have a unique/placeholder credential ID
		"Composition", compositions[0].SourceResourceID)
	require.NoError(suite.T(), err)
	require.Equal(suite.T(), 2, len(associations))
	require.Equal(suite.T(), []models.RelatedResource{
		{
			ResourceBaseUserID:                testSourceCredential.UserID,
			ResourceBaseSourceID:              compositions[0].SourceID,
			ResourceBaseSourceResourceType:    "Composition",
			ResourceBaseSourceResourceID:      compositions[0].SourceResourceID,
			RelatedResourceUserID:             testSourceCredential.UserID,
			RelatedResourceSourceID:           testSourceCredential.ID,
			RelatedResourceSourceResourceType: "Condition",
			RelatedResourceSourceResourceID:   "bec92fdc-8765-409b-9850-52786d31aa9b",
		},
		{
			ResourceBaseUserID:                testSourceCredential.UserID,
			ResourceBaseSourceID:              compositions[0].SourceID,
			ResourceBaseSourceResourceType:    "Composition",
			ResourceBaseSourceResourceID:      compositions[0].SourceResourceID,
			RelatedResourceUserID:             testSourceCredential.UserID,
			RelatedResourceSourceID:           testSourceCredential.ID,
			RelatedResourceSourceResourceType: "Condition",
			RelatedResourceSourceResourceID:   "cf39b665-4177-41e3-af34-149421cb895f",
		},
	}, associations)
}

func (suite *RepositoryTestSuite) TestAddResourceComposition_WithExistingComposition() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
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
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	testSourceCredential := models.SourceCredential{
		ModelBase: models.ModelBase{
			ID: uuid.MustParse("00000000-0000-0000-0000-000000000000"),
		},
		UserID:  userModel.ID,
		Patient: uuid.New().String(),
	}
	err = dbRepo.CreateSource(authContext, &testSourceCredential)
	require.NoError(suite.T(), err)

	//create existing composition
	emptyRawJson, err := json.Marshal(map[string]interface{}{})
	require.NoError(suite.T(), err)
	err = dbRepo.AddResourceComposition(authContext, "existing composition", []*models.ResourceBase{
		{
			OriginBase: models.OriginBase{
				SourceID:           testSourceCredential.ID,
				SourceResourceType: "Observation",
				SourceResourceID:   "1",
			},
			ResourceRaw: emptyRawJson,
		},
		{
			OriginBase: models.OriginBase{
				SourceID:           testSourceCredential.ID,
				SourceResourceType: "Observation",
				SourceResourceID:   "2",
			},
			ResourceRaw: emptyRawJson,
		},
		{
			OriginBase: models.OriginBase{
				SourceID:           testSourceCredential.ID,
				SourceResourceType: "Observation",
				SourceResourceID:   "3",
			},
			ResourceRaw: emptyRawJson,
		},
	})

	require.NoError(suite.T(), err)

	//find existing composition
	existingCompositions, err := dbRepo.ListResources(authContext, models.ListResourceQueryOptions{
		SourceID:           "00000000-0000-0000-0000-000000000000",
		SourceResourceType: "Composition",
	})
	require.NoError(suite.T(), err)
	require.Equal(suite.T(), 1, len(existingCompositions), "Only 1 composition should exist at this point")

	//test
	testCompositionData, err := os.ReadFile("./testdata/Composition_Create.json")
	require.NoError(suite.T(), err)

	type CompositionPayload struct {
		Title     string                 `json:"title"`
		Resources []*models.ResourceBase `json:"resources"`
	}
	var compositionPayload CompositionPayload
	err = json.Unmarshal(testCompositionData, &compositionPayload)
	require.NoError(suite.T(), err)

	//update resources with testSource Credential
	for i, _ := range compositionPayload.Resources {
		compositionPayload.Resources[i].SourceID = testSourceCredential.ID
	}
	//add the existing composition as a resource to this composition
	compositionPayload.Resources = append(compositionPayload.Resources, &existingCompositions[0])

	//test
	err = dbRepo.AddResourceComposition(authContext, compositionPayload.Title, compositionPayload.Resources)
	require.NoError(suite.T(), err)

	//assert
	//check that composition was created
	compositions, err := dbRepo.ListResources(authContext, models.ListResourceQueryOptions{
		SourceID:           "00000000-0000-0000-0000-000000000000",
		SourceResourceType: "Composition",
	})
	require.NoError(suite.T(), err)
	require.Equal(suite.T(), 1, len(compositions), "Only 1 composition should exist, the previous one should be deleted, and its related resources merged into this one.")

	//assert that the associations were created
	associations, err := dbRepo.FindResourceAssociationsByTypeAndId(authContext,
		&models.SourceCredential{UserID: userModel.ID, ModelBase: models.ModelBase{ID: uuid.Nil}}, //Compositions have a unique/placeholder credential ID
		"Composition", compositions[0].SourceResourceID)
	require.NoError(suite.T(), err)
	require.Equal(suite.T(), 5, len(associations))
	require.Equal(suite.T(), []models.RelatedResource{
		{
			ResourceBaseUserID:                testSourceCredential.UserID,
			ResourceBaseSourceID:              compositions[0].SourceID,
			ResourceBaseSourceResourceType:    "Composition",
			ResourceBaseSourceResourceID:      compositions[0].SourceResourceID,
			RelatedResourceUserID:             testSourceCredential.UserID,
			RelatedResourceSourceID:           testSourceCredential.ID,
			RelatedResourceSourceResourceType: "Condition",
			RelatedResourceSourceResourceID:   "bec92fdc-8765-409b-9850-52786d31aa9b",
		},
		{
			ResourceBaseUserID:                testSourceCredential.UserID,
			ResourceBaseSourceID:              compositions[0].SourceID,
			ResourceBaseSourceResourceType:    "Composition",
			ResourceBaseSourceResourceID:      compositions[0].SourceResourceID,
			RelatedResourceUserID:             testSourceCredential.UserID,
			RelatedResourceSourceID:           testSourceCredential.ID,
			RelatedResourceSourceResourceType: "Condition",
			RelatedResourceSourceResourceID:   "cf39b665-4177-41e3-af34-149421cb895f",
		},
		{
			ResourceBaseUserID:                testSourceCredential.UserID,
			ResourceBaseSourceID:              compositions[0].SourceID,
			ResourceBaseSourceResourceType:    "Composition",
			ResourceBaseSourceResourceID:      compositions[0].SourceResourceID,
			RelatedResourceUserID:             testSourceCredential.UserID,
			RelatedResourceSourceID:           testSourceCredential.ID,
			RelatedResourceSourceResourceType: "Observation",
			RelatedResourceSourceResourceID:   "1",
		},
		{
			ResourceBaseUserID:                testSourceCredential.UserID,
			ResourceBaseSourceID:              compositions[0].SourceID,
			ResourceBaseSourceResourceType:    "Composition",
			ResourceBaseSourceResourceID:      compositions[0].SourceResourceID,
			RelatedResourceUserID:             testSourceCredential.UserID,
			RelatedResourceSourceID:           testSourceCredential.ID,
			RelatedResourceSourceResourceType: "Observation",
			RelatedResourceSourceResourceID:   "2",
		},
		{
			ResourceBaseUserID:                testSourceCredential.UserID,
			ResourceBaseSourceID:              compositions[0].SourceID,
			ResourceBaseSourceResourceType:    "Composition",
			ResourceBaseSourceResourceID:      compositions[0].SourceResourceID,
			RelatedResourceUserID:             testSourceCredential.UserID,
			RelatedResourceSourceID:           testSourceCredential.ID,
			RelatedResourceSourceResourceType: "Observation",
			RelatedResourceSourceResourceID:   "3",
		},
	}, associations)

}

func (suite *RepositoryTestSuite) TestCreateBackgroundJob_Sync() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
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
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	//test
	sourceCredential := models.SourceCredential{ModelBase: models.ModelBase{ID: uuid.New()}, PlatformType: sourcePkg.PlatformType("bluebutton")}
	backgroundJob := models.NewSyncBackgroundJob(sourceCredential)
	err = dbRepo.CreateBackgroundJob(
		context.WithValue(authContext, pkg.ContextKeyTypeAuthUsername, "test_username"),
		backgroundJob,
	)

	//assert
	require.NoError(suite.T(), err)
	require.NotEqual(suite.T(), uuid.Nil, backgroundJob.ID)
	require.Equal(suite.T(), pkg.BackgroundJobTypeSync, backgroundJob.JobType)
	require.Equal(suite.T(), pkg.BackgroundJobStatusLocked, backgroundJob.JobStatus)
	require.NotNil(suite.T(), backgroundJob.LockedTime)
	require.Nil(suite.T(), backgroundJob.DoneTime)
	require.Equal(suite.T(), userModel.ID, backgroundJob.UserID)
}

func (suite *RepositoryTestSuite) TestListBackgroundJobs() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
	fakeConfig.EXPECT().GetString("log.level").Return("DEBUG").AnyTimes()
	dbRepo, err := NewRepository(fakeConfig, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())
	require.NoError(suite.T(), err)

	userModel := &models.User{
		Username: "test_username",
		Password: "testpassword",
		Email:    "test@test.com",
	}
	err = dbRepo.CreateUser(context.Background(), userModel)
	require.NoError(suite.T(), err)
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, userModel.Username)

	otherUserModel := &models.User{
		Username: "test_other_username",
		Password: "testpassword",
		Email:    "testother@test.com",
	}
	err = dbRepo.CreateUser(context.Background(), otherUserModel)
	require.NoError(suite.T(), err)

	testSourceCredential := models.SourceCredential{
		ModelBase: models.ModelBase{
			ID: uuid.New(),
		},
		UserID: userModel.ID,
	}

	backgroundJob := models.NewSyncBackgroundJob(testSourceCredential)
	err = dbRepo.CreateBackgroundJob(
		authContext,
		backgroundJob,
	)
	require.NoError(suite.T(), err)

	backgroundJob2 := models.NewSyncBackgroundJob(testSourceCredential)
	backgroundJob2.JobType = pkg.BackgroundJobTypeScheduledSync
	err = dbRepo.CreateBackgroundJob(
		authContext,
		backgroundJob2,
	)
	require.NoError(suite.T(), err)

	backgroundJob3 := models.NewSyncBackgroundJob(testSourceCredential)
	backgroundJob3.JobStatus = pkg.BackgroundJobStatusFailed
	err = dbRepo.CreateBackgroundJob(
		authContext,
		backgroundJob3,
	)
	require.NoError(suite.T(), err)

	//test
	foundAllBackgroundJobs, err := dbRepo.ListBackgroundJobs(authContext, models.BackgroundJobQueryOptions{})
	require.NoError(suite.T(), err)

	syncJobType := pkg.BackgroundJobTypeSync
	foundBackgroundJobsByType, err := dbRepo.ListBackgroundJobs(authContext, models.BackgroundJobQueryOptions{
		JobType: &syncJobType,
	})
	require.NoError(suite.T(), err)

	syncFailedStatus := pkg.BackgroundJobStatusFailed
	foundBackgroundJobsByStatus, err := dbRepo.ListBackgroundJobs(authContext, models.BackgroundJobQueryOptions{
		Status: &syncFailedStatus,
	})
	require.NoError(suite.T(), err)

	//assert
	require.Equal(suite.T(), 3, len(foundAllBackgroundJobs))
	require.Equal(suite.T(), 2, len(foundBackgroundJobsByType))
	require.Equal(suite.T(), 1, len(foundBackgroundJobsByStatus))
}

func (suite *RepositoryTestSuite) TestUpdateBackgroundJob() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
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
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	sourceCredential := models.SourceCredential{ModelBase: models.ModelBase{ID: uuid.New()}, PlatformType: sourcePkg.PlatformType("bluebutton")}
	backgroundJob := models.NewSyncBackgroundJob(sourceCredential)
	err = dbRepo.CreateBackgroundJob(
		context.WithValue(authContext, pkg.ContextKeyTypeAuthUsername, "test_username"),
		backgroundJob,
	)

	//test
	now := time.Now()
	backgroundJob.JobStatus = pkg.BackgroundJobStatusFailed
	backgroundJob.DoneTime = &now

	err = dbRepo.UpdateBackgroundJob(
		authContext,
		backgroundJob,
	)
	require.NoError(suite.T(), err)

	//list all records and ensure that the updated record is the same
	foundAllBackgroundJobs, err := dbRepo.ListBackgroundJobs(authContext, models.BackgroundJobQueryOptions{})
	require.NoError(suite.T(), err)

	//assert
	require.Equal(suite.T(), 1, len(foundAllBackgroundJobs))
	require.Equal(suite.T(), backgroundJob.ID, foundAllBackgroundJobs[0].ID)
	require.Equal(suite.T(), pkg.BackgroundJobStatusFailed, foundAllBackgroundJobs[0].JobStatus)
	require.NotNil(suite.T(), foundAllBackgroundJobs[0].DoneTime)
}
