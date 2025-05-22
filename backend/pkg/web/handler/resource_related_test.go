package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	mock_config "github.com/fastenhealth/fasten-onprem/backend/pkg/config/mock"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	mock_database "github.com/fastenhealth/fasten-onprem/backend/pkg/database/mock"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/gin-gonic/gin"
	"github.com/golang/mock/gomock"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
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
func (suite *ResourceRelatedHandlerTestSuite) TestEncounterUnlinkResource() {
	suite.T().Run("should successfully unlink resource and its shared neighbors", func(t *testing.T) {
		ctx, w, mockDB := suite.setupTestContextWithMocks(t)

		encounterId := "enc-success-123"
		resourceToUnlinkId := "obs-success-456"
		resourceToUnlinkType := "Observation"

		ctx.Params = gin.Params{
			{Key: "encounterId", Value: encounterId},
			{Key: "resourceId", Value: resourceToUnlinkId},
			{Key: "resourceType", Value: resourceToUnlinkType},
		}

		userID := uuid.New()
		encounterSourceID := uuid.New()
		resourceToUnlinkSourceID := uuid.New()
		sharedNeighborSourceID := uuid.New()

		mockEncounterDBID := uuid.New()
		mockPrimaryResourceToUnlinkDBID := uuid.New()

		mockEncounter := &models.ResourceBase{
			OriginBase: models.OriginBase{
				ModelBase:          models.ModelBase{ID: mockEncounterDBID},
				UserID:             userID,
				SourceID:           encounterSourceID,
				SourceResourceType: "Encounter",
				SourceResourceID:   encounterId,
			},
		}
		mockPrimaryResourceToUnlink := &models.ResourceBase{
			OriginBase: models.OriginBase{
				ModelBase:          models.ModelBase{ID: mockPrimaryResourceToUnlinkDBID},
				UserID:             userID,
				SourceID:           resourceToUnlinkSourceID,
				SourceResourceType: resourceToUnlinkType,
				SourceResourceID:   resourceToUnlinkId,
			},
		}

		mockEncounterSourceCred := &models.SourceCredential{ModelBase: models.ModelBase{ID: encounterSourceID}, UserID: userID}
		mockPrimaryResourceToUnlinkSourceCred := &models.SourceCredential{ModelBase: models.ModelBase{ID: resourceToUnlinkSourceID}, UserID: userID}

		directAssocEncToRes := models.RelatedResource{
			ResourceBaseUserID:                userID,
			ResourceBaseSourceID:              encounterSourceID,
			ResourceBaseSourceResourceType:    "Encounter",
			ResourceBaseSourceResourceID:      encounterId,
			RelatedResourceUserID:             userID,
			RelatedResourceSourceID:           resourceToUnlinkSourceID,
			RelatedResourceSourceResourceType: resourceToUnlinkType,
			RelatedResourceSourceResourceID:   resourceToUnlinkId,
		}
		directAssocResToEnc := models.RelatedResource{
			ResourceBaseUserID:                userID,
			ResourceBaseSourceID:              resourceToUnlinkSourceID,
			ResourceBaseSourceResourceType:    resourceToUnlinkType,
			ResourceBaseSourceResourceID:      resourceToUnlinkId,
			RelatedResourceUserID:             userID,
			RelatedResourceSourceID:           encounterSourceID,
			RelatedResourceSourceResourceType: "Encounter",
			RelatedResourceSourceResourceID:   encounterId,
		}

		sharedNeighborResourceID := "cond-shared-789"
		sharedNeighborResourceType := "Condition"
		assocEncToSharedNeighbor := models.RelatedResource{
			ResourceBaseUserID:                userID,
			ResourceBaseSourceID:              encounterSourceID,
			ResourceBaseSourceResourceType:    "Encounter",
			ResourceBaseSourceResourceID:      encounterId,
			RelatedResourceUserID:             userID,
			RelatedResourceSourceID:           sharedNeighborSourceID,
			RelatedResourceSourceResourceType: sharedNeighborResourceType,
			RelatedResourceSourceResourceID:   sharedNeighborResourceID,
		}

		mockEncounterAssocs := []models.RelatedResource{assocEncToSharedNeighbor}

		assocPrimaryToSharedNeighbor := models.RelatedResource{
			ResourceBaseUserID:                userID,
			ResourceBaseSourceID:              resourceToUnlinkSourceID,
			ResourceBaseSourceResourceType:    resourceToUnlinkType,
			ResourceBaseSourceResourceID:      resourceToUnlinkId,
			RelatedResourceUserID:             userID,
			RelatedResourceSourceID:           sharedNeighborSourceID,
			RelatedResourceSourceResourceType: sharedNeighborResourceType,
			RelatedResourceSourceResourceID:   sharedNeighborResourceID,
		}
		mockPrimaryResourceAssocs := []models.RelatedResource{assocPrimaryToSharedNeighbor}

		expectedAssociationsToRemove := []models.RelatedResource{directAssocEncToRes, directAssocResToEnc, assocEncToSharedNeighbor}

		mockDB.EXPECT().GetResourceByResourceTypeAndId(gomock.Any(), "Encounter", encounterId).Return(mockEncounter, nil)
		mockDB.EXPECT().GetResourceByResourceTypeAndId(gomock.Any(), resourceToUnlinkType, resourceToUnlinkId).Return(mockPrimaryResourceToUnlink, nil)
		mockDB.EXPECT().GetSource(gomock.Any(), encounterSourceID.String()).Return(mockEncounterSourceCred, nil)
		mockDB.EXPECT().GetSource(gomock.Any(), resourceToUnlinkSourceID.String()).Return(mockPrimaryResourceToUnlinkSourceCred, nil)

		mockDB.EXPECT().FindAllResourceAssociations(gomock.Any(), mockEncounterSourceCred, "Encounter", encounterId).Return(mockEncounterAssocs, nil)
		mockDB.EXPECT().FindAllResourceAssociations(gomock.Any(), mockPrimaryResourceToUnlinkSourceCred, resourceToUnlinkType, resourceToUnlinkId).Return(mockPrimaryResourceAssocs, nil)

		var capturedAssociations []models.RelatedResource
		mockDB.EXPECT().RemoveBulkResourceAssociations(gomock.Any(), gomock.Any()).
			DoAndReturn(func(_ context.Context, associations []models.RelatedResource) (int64, error) {
				capturedAssociations = associations
				return int64(len(expectedAssociationsToRemove)), nil
			}).Times(1)

		EncounterUnlinkResource(ctx)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.ElementsMatch(t, expectedAssociationsToRemove, capturedAssociations, "The list of associations to remove is not as expected")

		var responseBody map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &responseBody)
		require.NoError(t, err)

		success, ok := responseBody["success"].(bool)
		assert.True(t, ok, "Response 'success' field is not a boolean or not present")
		assert.True(t, success, "Response 'success' field was not true")

		rowsAffected, ok := responseBody["rowsAffected"].(float64)
		assert.True(t, ok, "Response 'rowsAffected' field is not a number or not present")
		assert.Equal(t, float64(len(expectedAssociationsToRemove)), rowsAffected, "Response 'rowsAffected' does not match")
	})

	suite.T().Run("should return error if encounter not found", func(t *testing.T) {
		ctx, w, mockDB := suite.setupTestContextWithMocks(t)

		encounterId := "nonexistent-enc-123"
		resourceId := "any-res-456"
		resourceType := "Observation"

		ctx.Params = gin.Params{
			{Key: "encounterId", Value: encounterId},
			{Key: "resourceId", Value: resourceId},
			{Key: "resourceType", Value: resourceType},
		}

		mockDB.EXPECT().GetResourceByResourceTypeAndId(gomock.Any(), "Encounter", encounterId).
			Return(nil, fmt.Errorf("simulated db error: record not found")).
			Times(1)

		EncounterUnlinkResource(ctx)

		assert.Equal(t, http.StatusInternalServerError, w.Code)

		var responseBody map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &responseBody)
		require.NoError(t, err)

		success, ok := responseBody["success"].(bool)
		assert.True(t, ok, "Response 'success' field is not a boolean or not present")
		assert.False(t, success, "Response 'success' field was not false")

		errMsg, ok := responseBody["error"].(string)
		assert.True(t, ok, "Response 'error' field is not a string or not present")
		assert.Equal(t, "could not find encounter", errMsg)
	})

	suite.T().Run("should return error if related resource not found", func(t *testing.T) {
		ctx, w, mockDB := suite.setupTestContextWithMocks(t)

		encounterId := "existing-enc-789"
		resourceId := "nonexistent-res-012"
		resourceType := "Procedure"

		ctx.Params = gin.Params{
			{Key: "encounterId", Value: encounterId},
			{Key: "resourceId", Value: resourceId},
			{Key: "resourceType", Value: resourceType},
		}

		mockDB.EXPECT().GetResourceByResourceTypeAndId(gomock.Any(), "Encounter", encounterId).
			Return(&models.ResourceBase{}, nil).
			Times(1)
		mockDB.EXPECT().GetResourceByResourceTypeAndId(gomock.Any(), resourceType, resourceId).
			Return(nil, fmt.Errorf("simulated db error: related resource not found")).
			Times(1)

		EncounterUnlinkResource(ctx)

		assert.Equal(t, http.StatusInternalServerError, w.Code)

		var responseBody map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &responseBody)
		require.NoError(t, err)

		success, ok := responseBody["success"].(bool)
		assert.True(t, ok, "Response 'success' field is not a boolean or not present")
		assert.False(t, success, "Response 'success' field was not false")

		errMsg, ok := responseBody["error"].(string)
		assert.True(t, ok, "Response 'error' field is not a string or not present")
		assert.Equal(t, "could not find related resource", errMsg)
	})

	suite.T().Run("should return error if RemoveBulkResourceAssociations fails", func(t *testing.T) {
		ctx, w, mockDB := suite.setupTestContextWithMocks(t)

		encounterId := "enc-rm-fail-123"
		resourceId := "obs-rm-fail-456"
		resourceType := "Observation"

		ctx.Params = gin.Params{
			{Key: "encounterId", Value: encounterId},
			{Key: "resourceId", Value: resourceId},
			{Key: "resourceType", Value: resourceType},
		}

		userID := uuid.New()
		encounterSourceID := uuid.New()
		resourceSourceID := uuid.New()

		mockEncounterDBID := uuid.New()
		mockPrimaryResourceToUnlinkDBID := uuid.New()

		mockEncounter := &models.ResourceBase{
			OriginBase: models.OriginBase{
				ModelBase:          models.ModelBase{ID: mockEncounterDBID},
				UserID:             userID,
				SourceID:           encounterSourceID,
				SourceResourceType: "Encounter",
				SourceResourceID:   encounterId,
			},
		}
		mockPrimaryResourceToUnlink := &models.ResourceBase{
			OriginBase: models.OriginBase{
				ModelBase:          models.ModelBase{ID: mockPrimaryResourceToUnlinkDBID},
				UserID:             userID,
				SourceID:           resourceSourceID,
				SourceResourceType: resourceType,
				SourceResourceID:   resourceId,
			},
		}

		mockEncounterSourceCred := &models.SourceCredential{ModelBase: models.ModelBase{ID: encounterSourceID}, UserID: userID}
		mockPrimaryResourceToUnlinkSourceCred := &models.SourceCredential{ModelBase: models.ModelBase{ID: resourceSourceID}, UserID: userID}

		assocEncToSharedNeighbor := models.RelatedResource{}
		mockEncounterAssocs := []models.RelatedResource{assocEncToSharedNeighbor}
		assocPrimaryToSharedNeighbor := models.RelatedResource{}
		mockPrimaryResourceAssocs := []models.RelatedResource{assocPrimaryToSharedNeighbor}

		mockDB.EXPECT().GetResourceByResourceTypeAndId(gomock.Any(), "Encounter", encounterId).Return(mockEncounter, nil)
		mockDB.EXPECT().GetResourceByResourceTypeAndId(gomock.Any(), resourceType, resourceId).Return(mockPrimaryResourceToUnlink, nil)
		mockDB.EXPECT().GetSource(gomock.Any(), encounterSourceID.String()).Return(mockEncounterSourceCred, nil)
		mockDB.EXPECT().GetSource(gomock.Any(), resourceSourceID.String()).Return(mockPrimaryResourceToUnlinkSourceCred, nil)
		mockDB.EXPECT().FindAllResourceAssociations(gomock.Any(), mockEncounterSourceCred, "Encounter", encounterId).Return(mockEncounterAssocs, nil)
		mockDB.EXPECT().FindAllResourceAssociations(gomock.Any(), mockPrimaryResourceToUnlinkSourceCred, resourceType, resourceId).Return(mockPrimaryResourceAssocs, nil)

		mockDB.EXPECT().RemoveBulkResourceAssociations(gomock.Any(), gomock.Any()).
			Return(int64(0), fmt.Errorf("simulated db error during bulk remove")).
			Times(1)

		EncounterUnlinkResource(ctx)

		assert.Equal(t, http.StatusInternalServerError, w.Code)

		var responseBody map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &responseBody)
		require.NoError(t, err)

		success, ok := responseBody["success"].(bool)
		assert.True(t, ok, "Response 'success' field is not a boolean or not present")
		assert.False(t, success, "Response 'success' field was not false")

		errMsg, ok := responseBody["error"].(string)
		assert.True(t, ok, "Response 'error' field is not a string or not present")

		assert.Equal(t, "could not remove resource associations", errMsg)
	})

}

func (suite *ResourceRelatedHandlerTestSuite) setupTestContextWithMocks(t *testing.T) (*gin.Context, *httptest.ResponseRecorder, *mock_database.MockDatabaseRepository) {
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)

	mockDB := mock_database.NewMockDatabaseRepository(suite.MockCtrl)

	ctx.Set(pkg.ContextKeyTypeLogger, logrus.WithField("test", t.Name()))
	ctx.Set(pkg.ContextKeyTypeDatabase, mockDB)
	ctx.Set(pkg.ContextKeyTypeConfig, suite.AppConfig)
	ctx.Set(pkg.ContextKeyTypeEventBusServer, suite.AppEventBus)
	ctx.Set(pkg.ContextKeyTypeAuthUsername, "test_username")

	return ctx, w, mockDB
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
