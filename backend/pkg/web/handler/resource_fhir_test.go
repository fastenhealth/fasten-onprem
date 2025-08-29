package handler

import (
	"bytes"
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

const fhirResourcePath = "/resource/fhir"

type ResourceFhirHandlerTestSuite struct {
	suite.Suite
	MockCtrl     *gomock.Controller
	TestDatabase *os.File

	AppConfig     *mock_config.MockInterface
	AppRepository database.DatabaseRepository
	AppEventBus   event_bus.Interface
	SourceId      uuid.UUID
}
func setupGinContext(ctx *gin.Context, suite *ResourceFhirHandlerTestSuite) {
	ctx.Set(pkg.ContextKeyTypeLogger, logrus.WithField("test", suite.T().Name()))
	ctx.Set(pkg.ContextKeyTypeDatabase, suite.AppRepository)
	ctx.Set(pkg.ContextKeyTypeConfig, suite.AppConfig)
	ctx.Set(pkg.ContextKeyTypeEventBusServer, suite.AppEventBus)
	ctx.Set(pkg.ContextKeyTypeAuthUsername, "test_user")
}

func addParamsToGinContext(ctx *gin.Context,params []gin.Param) error {
	var baseUrl = fhirResourcePath +  "?"
	for i,param  := range params {
		if i > 0 {
			baseUrl += "&"
		}
		baseUrl += param.Key + "=" + param.Value
	}
	body := &bytes.Buffer{}
	req, err := http.NewRequest("GET", baseUrl, body)
	if err!= nil {
        log.Fatal("Could not make http request ", err.Error())
		return err
	}
	ctx.Request = req
	return nil
}

//SetupAllSuite has a SetupSuite method, which will run before the tests in the suite are run.
func (suite *ResourceFhirHandlerTestSuite) SetupSuite() {
	suiteName  := suite.T().Name()
	suite.MockCtrl = gomock.NewController(suite.T())

	// ioutils is deprecated, used os.CreateTemp
	dbFile, err := os.CreateTemp("", fmt.Sprintf("%s.*.db", suiteName))
	if err != nil {
		log.Fatal(err)
	}
	suite.TestDatabase = dbFile

	appConfig := mock_config.NewMockInterface(suite.MockCtrl)
	appConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	appConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	appConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
	appConfig.EXPECT().IsSet("search").Return(false).AnyTimes()
	appConfig.EXPECT().GetString("log.level").Return("INFO").AnyTimes()
	suite.AppConfig = appConfig

	appRepo, err := database.NewRepository(suite.AppConfig, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())
	suite.AppRepository = appRepo

	suite.AppEventBus = event_bus.NewNoopEventBusServer()
	appRepo.CreateUser(context.Background(), &models.User{
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

// TearDownAllSuite has a TearDownSuite method, which will run after all the tests in the suite have been run.
func (suite *ResourceFhirHandlerTestSuite) TearDownSuite() {
	suite.MockCtrl.Finish()
	os.Remove(suite.TestDatabase.Name())
}

func TestResourceHandlerTestSuite(t *testing.T) {
	suite.Run(t, new(ResourceFhirHandlerTestSuite))
}


func (suite *ResourceFhirHandlerTestSuite) TestGetResourceFhirHandler() {
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	setupGinContext(ctx,suite)

	ctx.AddParam("sourceId", suite.SourceId.String())
	ctx.AddParam("resourceId", "57959813-8cd2-4e3c-8970-e4364b74980a")

	GetResourceFhir(ctx)

	type ResponseWrapper struct {
		Data    *models.ResourceBase `json:"data"`
		Success bool                 `json:"success"`
	}
	var respWrapper ResponseWrapper
	err := json.Unmarshal(w.Body.Bytes(), &respWrapper)
	require.NoError(suite.T(), err)
	require.Equal(suite.T(), true, respWrapper.Success)
	require.Equal(suite.T(), "Patient", respWrapper.Data.SourceResourceType)
	require.Equal(suite.T(), suite.SourceId, respWrapper.Data.SourceID)
	require.Equal(suite.T(), "57959813-8cd2-4e3c-8970-e4364b74980a", respWrapper.Data.SourceResourceID)

}

func (suite *ResourceFhirHandlerTestSuite) TestGetResourceFhirHandler_WithInvalidSourceResourceId() {
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	setupGinContext(ctx,suite)

	ctx.AddParam("sourceId", "-1")
	ctx.AddParam("resourceId", "57959813-9999-4e3c-8970-e4364b74980a")

	GetResourceFhir(ctx)

	type ResponseWrapper struct {
		Data    *models.ResourceBase `json:"data"`
		Success bool                 `json:"success"`
	}
	var respWrapper ResponseWrapper
	err := json.Unmarshal(w.Body.Bytes(), &respWrapper)
	require.NoError(suite.T(),err)
	
	require.Equal(suite.T(),false,respWrapper.Success)
	require.Nil(suite.T(),respWrapper.Data)
	
}

func (suite *ResourceFhirHandlerTestSuite) TestListResourceFhirHandler_WithValidSourceResourceId() {
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	setupGinContext(ctx, suite)
	
	err := addParamsToGinContext(ctx, []gin.Param {
		{
            Key: "sourceResourceID",
            Value: "cd72a003-ffa9-44a2-9e9c-97004144f5d8",
        },
	})
	suite.NoError(err)

	ListResourceFhir(ctx)

	type ResponseWrapper struct {
		Data    []models.ResourceBase `json:"data"`
		Success bool                  `json:"success"`
	}
	var respWrapper ResponseWrapper
	err = json.Unmarshal(w.Body.Bytes(), &respWrapper)
	require.NoError(suite.T(), err)
	require.Equal(suite.T(), true, respWrapper.Success)
	require.Equal(suite.T(), 1, len(respWrapper.Data))
	require.Equal(suite.T(), suite.SourceId, respWrapper.Data[0].SourceID)
	require.Equal(suite.T(), "cd72a003-ffa9-44a2-9e9c-97004144f5d8", respWrapper.Data[0].SourceResourceID)
}

func (suite *ResourceFhirHandlerTestSuite) TestListResourceFhirHandler_WithValidSourceResourceType() {
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	setupGinContext(ctx, suite)

	err := addParamsToGinContext(ctx, []gin.Param {
		{
			Key: "sourceResourceType",
            Value: "Patient",
		},
	})
	suite.NoError(err)

	ListResourceFhir(ctx)

	type ResponseWrapper struct {
		Data    []models.ResourceBase `json:"data"`
		Success bool                  `json:"success"`
	}
	var respWrapper ResponseWrapper
	err = json.Unmarshal(w.Body.Bytes(), &respWrapper)
	require.NoError(suite.T(), err)
	require.Equal(suite.T(), true, respWrapper.Success)
	for _, data := range respWrapper.Data {
		require.Equal(suite.T(), "Patient", data.SourceResourceType)
	}
}

func (suite *ResourceFhirHandlerTestSuite) TestListResourceFhirHandler_WithInValidSourceResourceType() {
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	setupGinContext(ctx, suite)

	err := addParamsToGinContext(ctx, []gin.Param {
		{
			Key: "sourceResourceType",
            Value: "org",
		},
	})
	suite.NoError(err)
	ListResourceFhir(ctx)

	type ResponseWrapper struct {
		Data    []models.ResourceBase `json:"data"`
		Success bool                  `json:"success"`
	}
	var respWrapper ResponseWrapper
	err = json.Unmarshal(w.Body.Bytes(), &respWrapper)
	require.NoError(suite.T(), err)
	require.Equal(suite.T(), false, respWrapper.Success)
	require.Empty(suite.T(),respWrapper.Data)
}


func (suite *ResourceFhirHandlerTestSuite) TestListResourceFhirHandler_WithValidSourceIdAndPageAndSort() {
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	setupGinContext(ctx, suite)

	err := addParamsToGinContext(ctx, []gin.Param{
		{
            Key: "sourceID",
            Value: suite.SourceId.String(),
        },
		{
			Key: "page",
			Value: "2",
		},
    })
	suite.NoError(err)

	ListResourceFhir(ctx)

	type ResponseWrapper struct {
		Data    []models.ResourceBase `json:"data"`
		Success bool                  `json:"success"`
	}
	var respWrapper ResponseWrapper
	err = json.Unmarshal(w.Body.Bytes(), &respWrapper)
	require.NoError(suite.T(), err)
	require.Equal(suite.T(), true, respWrapper.Success)
	require.Equal(suite.T(), pkg.ResourceListPageSize, len(respWrapper.Data))
	for _, data := range respWrapper.Data {
		require.Equal(suite.T(), suite.SourceId, data.SourceID)
	}

	n := len(respWrapper.Data)
	for i := 0; i < n-1; i++ {
		cmp := (*respWrapper.Data[i].SortDate).Compare(*respWrapper.Data[i+1].SortDate)
		require.Equal(suite.T(), true, cmp == 0 || cmp == 1)
	}

}

func (suite *ResourceFhirHandlerTestSuite) TestListResourceFhirHandler_SortingByTitle() {
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	setupGinContext(ctx, suite)


	err := addParamsToGinContext(ctx, []gin.Param {
		{
            Key: "sortBy",
            Value: "title",
        },
		{
            Key: "page",
            Value: "2",
        },
		{
            Key: "sourceID",
            Value: suite.SourceId.String(),
        },
	})
	suite.NoError(err)
	
	ListResourceFhir(ctx)

	type ResponseWrapper struct {
		Data    []models.ResourceBase `json:"data"`
		Success bool                  `json:"success"`
	}
	var respWrapper ResponseWrapper
	err = json.Unmarshal(w.Body.Bytes(), &respWrapper)
	require.NoError(suite.T(), err)
	require.Equal(suite.T(), true, respWrapper.Success)
	require.Equal(suite.T(), pkg.ResourceListPageSize, len(respWrapper.Data))

	n := len(respWrapper.Data)
	for i := 0; i < n-1; i++ {
		require.Equal(suite.T(), true, (*respWrapper.Data[i].SortTitle) <= (*respWrapper.Data[i+1].SortTitle))
	}

}

func (suite *ResourceFhirHandlerTestSuite) TestListResourceFhirHandler_WithInvalidSourceResourceId() {
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	setupGinContext(ctx, suite)
 
	err := addParamsToGinContext(ctx, []gin.Param {
		{
			Key: "sourceID",
			Value: "-1",
		},
		{
			Key: "resourceID",
			Value: "-1",
		},
	})
	suite.NoError(err)
	
	ListResourceFhir(ctx)

	type ResponseWrapper struct {
		Data    *[]models.ResourceBase `json:"data"`
		Success bool                   `json:"success"`
	}
	var respWrapper ResponseWrapper
	err = json.Unmarshal(w.Body.Bytes(), &respWrapper)
	require.NoError(suite.T(), err)

	require.Equal(suite.T(), false, respWrapper.Success)
	require.Empty(suite.T(), respWrapper.Data)

}

func (suite *ResourceFhirHandlerTestSuite) TestListResourceFhirHandler_WithInvalidPage() {
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	setupGinContext(ctx, suite)

	err := addParamsToGinContext(ctx, []gin.Param {
		{
            Key: "page",
            Value: "page",
        },
	})
	suite.NoError(err)
	
	ListResourceFhir(ctx)

	type ResponseWrapper struct {
		Data    *[]models.ResourceBase `json:"data"`
		Success bool                   `json:"success"`
	}
	var respWrapper ResponseWrapper
	err = json.Unmarshal(w.Body.Bytes(), &respWrapper)
	require.NoError(suite.T(), err)

	require.Equal(suite.T(), false, respWrapper.Success)
	require.Empty(suite.T(), respWrapper.Data)

}
