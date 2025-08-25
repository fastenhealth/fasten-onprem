package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	mock_config "github.com/fastenhealth/fasten-onprem/backend/pkg/config/mock"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/gin-gonic/gin"
	"github.com/golang/mock/gomock"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
	"io"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

// Go through this page to understand how this file is structured.
// https://pkg.go.dev/github.com/stretchr/testify/suite#section-documentation

// Define the suite, and absorb the built-in basic suite
// functionality from testify - including a T() method which
// returns the current testing context
type SourceHandlerTestSuite struct {
	suite.Suite
	MockCtrl     *gomock.Controller
	TestDatabase *os.File

	AppConfig     *mock_config.MockInterface
	AppRepository database.DatabaseRepository
	AppEventBus   event_bus.Interface
}

// BeforeTest has a function to be executed right before the test starts and receives the suite and test names as input
func (suite *SourceHandlerTestSuite) BeforeTest(suiteName, testName string) {
	suite.MockCtrl = gomock.NewController(suite.T())

	dbFile, err := ioutil.TempFile("", fmt.Sprintf("%s.*.db", testName))
	if err != nil {
		log.Fatal(err)
	}
	suite.TestDatabase = dbFile

	appConfig := mock_config.NewMockInterface(suite.MockCtrl)
	appConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	appConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	appConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
	appConfig.EXPECT().GetString("log.level").Return("INFO").AnyTimes()
	appConfig.EXPECT().GetBool("database.validation_mode").Return(false).AnyTimes()
	appConfig.EXPECT().GetBool("database.encryption.enabled").Return(false).AnyTimes()
	suite.AppConfig = appConfig

	appRepo, err := database.NewRepository(suite.AppConfig, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())
	suite.AppRepository = appRepo

	suite.AppEventBus = event_bus.NewNoopEventBusServer()

	appRepo.CreateUser(context.Background(), &models.User{
		Username: "test_username",
		Password: "test",
	})

}

// AfterTest has a function to be executed right after the test finishes and receives the suite and test names as input
func (suite *SourceHandlerTestSuite) AfterTest(suiteName, testName string) {
	suite.MockCtrl.Finish()
	os.Remove(suite.TestDatabase.Name())
}

func CreateManualSourceHttpRequestFromFile(fileName string) (*http.Request, error) {

	file, err := os.Open(fileName)
	if err != nil {
		log.Fatal("Could not open file ", err.Error())
		return nil, err
	}
	defer file.Close()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("file", filepath.Base(file.Name()))
	io.Copy(part, file)
	writer.Close()

	req, err := http.NewRequest("POST", "/source/manual", body)
	if err != nil {
		log.Fatal("Could not make http request ", err.Error())
		return nil, err
	}
	req.Header.Add("Content-Type", writer.FormDataContentType())

	return req, nil
}

// In order for 'go test' to run this suite, we need to create
// a normal test function and pass our suite to suite.Run
func TestSourceHandlerTestSuite(t *testing.T) {
	suite.Run(t, new(SourceHandlerTestSuite))
}

func (suite *SourceHandlerTestSuite) TestCreateManualSourceHandler() {
	//setup
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	ctx.Set(pkg.ContextKeyTypeLogger, logrus.WithField("test", suite.T().Name()))
	ctx.Set(pkg.ContextKeyTypeDatabase, suite.AppRepository)
	ctx.Set(pkg.ContextKeyTypeConfig, suite.AppConfig)
	ctx.Set(pkg.ContextKeyTypeEventBusServer, suite.AppEventBus)
	ctx.Set(pkg.ContextKeyTypeAuthUsername, "test_username")

	//test
	req, err := CreateManualSourceHttpRequestFromFile("testdata/Tania553_Harris789_545c2380-b77f-4919-ab5d-0f615f877250.json")
	require.NoError(suite.T(), err)
	ctx.Request = req

	CreateManualSource(ctx)

	//assert
	require.Equal(suite.T(), http.StatusOK, w.Code)

	type ResponseWrapper struct {
		Data struct {
			UpdatedResources []string `json:"UpdatedResources"`
			TotalResources   int      `json:"TotalResources"`
		} `json:"data"`
		Success bool                    `json:"success"`
		Source  models.SourceCredential `json:"source"`
	}
	var respWrapper ResponseWrapper
	err = json.Unmarshal(w.Body.Bytes(), &respWrapper)
	require.NoError(suite.T(), err)

	require.Equal(suite.T(), true, respWrapper.Success)
	require.Equal(suite.T(), "manual", string(respWrapper.Source.PlatformType))
	require.Equal(suite.T(), 196, respWrapper.Data.TotalResources)
	summary, err := suite.AppRepository.GetSourceSummary(ctx, respWrapper.Source.ID.String())
	require.NoError(suite.T(), err)
	require.Equal(suite.T(), map[string]interface{}{
		"count":         int64(5),
		"resource_type": "Condition",
		"source_id":     respWrapper.Source.ID.String(),
	}, summary.ResourceTypeCounts[3])

}

// bug: https://github.com/fastenhealth/fasten-onprem/pull/486
func (suite *SourceHandlerTestSuite) TestCreateManualSourceHandler_ShouldExtractPatientIdFromConvertedCCDA() {
	//setup
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	ctx.Set(pkg.ContextKeyTypeLogger, logrus.WithField("test", suite.T().Name()))
	ctx.Set(pkg.ContextKeyTypeDatabase, suite.AppRepository)
	ctx.Set(pkg.ContextKeyTypeConfig, suite.AppConfig)
	ctx.Set(pkg.ContextKeyTypeEventBusServer, suite.AppEventBus)
	ctx.Set(pkg.ContextKeyTypeAuthUsername, "test_username")

	//test
	req, err := CreateManualSourceHttpRequestFromFile("testdata/ccda_to_fhir_converted_C-CDA_R2-1_CCD.xml.json")
	require.NoError(suite.T(), err)
	ctx.Request = req

	CreateManualSource(ctx)

	//assert
	require.Equal(suite.T(), http.StatusOK, w.Code)

	type ResponseWrapper struct {
		Data struct {
			UpdatedResources []string `json:"UpdatedResources"`
			TotalResources   int      `json:"TotalResources"`
		} `json:"data"`
		Success bool                    `json:"success"`
		Source  models.SourceCredential `json:"source"`
	}
	var respWrapper ResponseWrapper
	err = json.Unmarshal(w.Body.Bytes(), &respWrapper)
	require.NoError(suite.T(), err)

	require.Equal(suite.T(), true, respWrapper.Success)
	require.Equal(suite.T(), "manual", string(respWrapper.Source.PlatformType))
	require.Equal(suite.T(), 65, respWrapper.Data.TotalResources)
	summary, err := suite.AppRepository.GetSourceSummary(ctx, respWrapper.Source.ID.String())
	require.NoError(suite.T(), err)
	require.Equal(suite.T(), map[string]interface{}{
		"count":         int64(1),
		"resource_type": "Consent",
		"source_id":     respWrapper.Source.ID.String(),
	}, summary.ResourceTypeCounts[3])

}
