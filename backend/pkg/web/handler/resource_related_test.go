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
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
	"io"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

// Go through this page to understand how this file is structured.
// https://pkg.go.dev/github.com/stretchr/testify/suite#section-documentation

// Define the suite, and absorb the built-in basic suite
// functionality from testify - including a T() method which
// returns the current testing context
type ResourceRelatedHandlerTestSuite struct {
	suite.Suite
	MockCtrl     *gomock.Controller
	TestDatabase *os.File

	AppConfig     *mock_config.MockInterface
	AppRepository database.DatabaseRepository
	AppEventBus   event_bus.Interface
}

// BeforeTest has a function to be executed right before the test starts and receives the suite and test names as input
func (suite *ResourceRelatedHandlerTestSuite) BeforeTest(suiteName, testName string) {
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
func (suite *ResourceRelatedHandlerTestSuite) AfterTest(suiteName, testName string) {
	suite.MockCtrl.Finish()
	os.Remove(suite.TestDatabase.Name())
}

// In order for 'go test' to run this suite, we need to create
// a normal test function and pass our suite to suite.Run
func TestResourceRelatedHandlerTestSuite(t *testing.T) {
	suite.Run(t, new(ResourceRelatedHandlerTestSuite))
}

func (suite *ResourceRelatedHandlerTestSuite) TestResourceRelatedHandlerTestSuite() {
	//setup
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	ctx.Set(pkg.ContextKeyTypeLogger, logrus.WithField("test", suite.T().Name()))
	ctx.Set(pkg.ContextKeyTypeDatabase, suite.AppRepository)
	ctx.Set(pkg.ContextKeyTypeConfig, suite.AppConfig)
	ctx.Set(pkg.ContextKeyTypeEventBusServer, suite.AppEventBus)
	ctx.Set(pkg.ContextKeyTypeAuthUsername, "test_username")

	//test
	relatedJsonForm, relatedJsonWriter := createMultipartFormData(suite.T(), "file", "testdata/related.json") // just pass the file name
	relatedReq, err := http.NewRequest("POST", "/api/v1/resource/related", &relatedJsonForm)
	// set the content type, this will contain the boundary.
	relatedReq.Header.Set("Content-Type", relatedJsonWriter.FormDataContentType())
	ctx.Request = relatedReq
	require.NoError(suite.T(), err)

	CreateRelatedResources(ctx)

	var responseWrapper models.ResponseWrapper
	err = json.Unmarshal(w.Body.Bytes(), &responseWrapper)
	require.NoError(suite.T(), err)

	summary := responseWrapper.Data.(map[string]interface{})

	//assert
	assert.EqualValues(suite.T(), http.StatusOK, w.Code)
	assert.Equal(suite.T(), summary["TotalResources"], float64(3))

}

// https://stackoverflow.com/a/56696333/1157633
func createMultipartFormData(t *testing.T, fieldName, fileName string) (bytes.Buffer, *multipart.Writer) {
	var b bytes.Buffer
	var err error
	w := multipart.NewWriter(&b)
	var fw io.Writer
	file := mustOpen(fileName)
	if fw, err = w.CreateFormFile(fieldName, file.Name()); err != nil {
		t.Errorf("Error creating writer: %v", err)
	}
	if _, err = io.Copy(fw, file); err != nil {
		t.Errorf("Error with io.Copy: %v", err)
	}
	w.Close()
	return b, w
}

func mustOpen(f string) *os.File {
	r, err := os.Open(f)
	if err != nil {
		pwd, _ := os.Getwd()
		fmt.Println("PWD: ", pwd)
		panic(err)
	}
	return r
}
