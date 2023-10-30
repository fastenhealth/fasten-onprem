package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	mock_config "github.com/fastenhealth/fasten-onprem/backend/pkg/config/mock"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/google/uuid"

	"github.com/gin-gonic/gin"
	"github.com/golang/mock/gomock"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
)

type ResourcFhirHandlerTestSuite struct {
	suite.Suite
	MockCtrl     *gomock.Controller
	TestDatabase *os.File

	AppConfig     *mock_config.MockInterface
	AppRepository database.DatabaseRepository
	AppEventBus   event_bus.Interface
	SourceId 	  uuid.UUID
}


func (suite *ResourcFhirHandlerTestSuite) BeforeTest(suiteName string, testName string){
	suite.MockCtrl = gomock.NewController(suite.T())
	
	// ioutils is deprecated, used os.CreateTemp
	dbFile, err := os.CreateTemp("",fmt.Sprintf("%s.*.db",suiteName))
	if err!=nil {
		log.Fatal(err)
	}
	suite.TestDatabase = dbFile

    appConfig := mock_config.NewMockInterface(suite.MockCtrl)
	appConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	appConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	appConfig.EXPECT().GetString("log.level").Return("INFO").AnyTimes()
	suite.AppConfig = appConfig

	appRepo, err := database.NewRepository(suite.AppConfig,logrus.WithField("test",suite.T().Name()),event_bus.NewNoopEventBusServer())
	suite.AppRepository = appRepo

	suite.AppEventBus = event_bus.NewNoopEventBusServer()
	appRepo.CreateUser(context.Background(),&models.User{
		Username: "test_user",
		Password: "test",
	})
	
	//Pre adding the source data
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	ctx.Set(pkg.ContextKeyTypeLogger, logrus.WithField("test", suite.T().Name()))
	ctx.Set(pkg.ContextKeyTypeDatabase, suite.AppRepository)
	ctx.Set(pkg.ContextKeyTypeConfig, suite.AppConfig)
	ctx.Set(pkg.ContextKeyTypeEventBusServer, suite.AppEventBus)
	ctx.Set(pkg.ContextKeyTypeAuthUsername, "test_user")

	req, err := CreateManualSourceHttpRequestFromFile("testdata/Tania553_Harris789_545c2380-b77f-4919-ab5d-0f615f877250.json")
	require.NoError(suite.T(), err)
	ctx.Request = req

	CreateManualSource(ctx)
	//assert 
	require.Equal(suite.T(), http.StatusOK, w.Code)	
	type ResponseWrapper struct {
		Success bool                    `json:"success"`
		Source  models.SourceCredential `json:"source"`
	}

	var respWrapper ResponseWrapper
	err = json.Unmarshal(w.Body.Bytes(), &respWrapper)
	require.NoError(suite.T(), err)
	
	suite.SourceId = respWrapper.Source.ID
}


// AfterTest has a function to be executed right after the test finishes and receives the suite and test names as input
func (suite *ResourcFhirHandlerTestSuite) AfterTest(suiteName, testName string) {
	suite.MockCtrl.Finish()
	os.Remove(suite.TestDatabase.Name())
}

func TestResourceHandlerTestSuite(t *testing.T) {
	suite.Run(t, new(ResourcFhirHandlerTestSuite))
}

func (suite *ResourcFhirHandlerTestSuite) TestGetResourceFhirHandler() {
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	ctx.Set(pkg.ContextKeyTypeLogger, logrus.WithField("test", suite.T().Name()))
	ctx.Set(pkg.ContextKeyTypeDatabase, suite.AppRepository)
	ctx.Set(pkg.ContextKeyTypeConfig, suite.AppConfig)
	ctx.Set(pkg.ContextKeyTypeEventBusServer, suite.AppEventBus)
	ctx.Set(pkg.ContextKeyTypeAuthUsername, "test_user")

	ctx.AddParam("sourceId", suite.SourceId.String())
	ctx.AddParam("resourceId", "57959813-8cd2-4e3c-8970-e4364b74980a")
	
	GetResourceFhir(ctx)

	type ResponseWrapper struct {
		Data *models.ResourceBase  `json:"data"`
		Success bool               `json:"success"`
	}
	var respWrapper ResponseWrapper
	err := json.Unmarshal(w.Body.Bytes(), &respWrapper)
	require.NoError(suite.T(),err)
	require.Equal(suite.T(),true,respWrapper.Success)
	require.Equal(suite.T(),"Patient",respWrapper.Data.SourceResourceType)
	require.Equal(suite.T(),suite.SourceId, respWrapper.Data.SourceID)
	require.Equal(suite.T(),"57959813-8cd2-4e3c-8970-e4364b74980a", respWrapper.Data.SourceResourceID)
	
}

func (suite *ResourcFhirHandlerTestSuite) TestGetResourceFhirHandler_WithInvalidSourceResourceId() {
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	ctx.Set(pkg.ContextKeyTypeLogger, logrus.WithField("test", suite.T().Name()))
	ctx.Set(pkg.ContextKeyTypeDatabase, suite.AppRepository)
	ctx.Set(pkg.ContextKeyTypeConfig, suite.AppConfig)
	ctx.Set(pkg.ContextKeyTypeEventBusServer, suite.AppEventBus)
	ctx.Set(pkg.ContextKeyTypeAuthUsername, "test_user")

	ctx.AddParam("sourceId", "-1")
	ctx.AddParam("resourceId", "57959813-9999-4e3c-8970-e4364b74980a")
	
	GetResourceFhir(ctx)

	type ResponseWrapper struct {
		Data *models.ResourceBase  `json:"data"`
		Success bool               `json:"success"`
	}
	var respWrapper ResponseWrapper
	err := json.Unmarshal(w.Body.Bytes(), &respWrapper)
	require.NoError(suite.T(),err)
	
	require.Equal(suite.T(),false,respWrapper.Success)
	require.Nil(suite.T(),respWrapper.Data)
	
}