package handler

import (
	"context"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/fastenhealth/fasten-sources/clients/factory"
	sourceModels "github.com/fastenhealth/fasten-sources/clients/models"
	sourceDefinitions "github.com/fastenhealth/fasten-sources/definitions"
	sourcePkg "github.com/fastenhealth/fasten-sources/pkg"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

func CreateReconnectSource(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	sourceCred := models.SourceCredential{}
	if err := c.ShouldBindJSON(&sourceCred); err != nil {
		err = fmt.Errorf("an error occurred while parsing posted source credential: %s", err)
		logger.Errorln(err)
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	logger.Infof("Parsed Create SourceCredential Credentials Payload: %v", sourceCred)

	//get the endpoint definition
	endpointDefinition, err := sourceDefinitions.GetSourceDefinition(sourceDefinitions.GetSourceConfigOptions{
		EndpointId: sourceCred.EndpointID.String(),
	})

	if err != nil {
		err = fmt.Errorf("an error occurred while retrieving source definition: %w", err)
		logger.Errorln(err)
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	if endpointDefinition.DynamicClientRegistrationMode == "user-authenticated" {
		logger.Warnf("This client requires a dynamic client registration, starting registration process")

		if len(endpointDefinition.RegistrationEndpoint) == 0 {
			err := fmt.Errorf("this client requires dynamic registration, but does not provide a registration endpoint: %s", endpointDefinition.DynamicClientRegistrationMode)
			logger.Errorln(err)
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
			return
		}

		err := sourceCred.RegisterDynamicClient()
		if err != nil {
			err = fmt.Errorf("an error occurred while registering dynamic client: %w", err)
			logger.Errorln(err)
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
			return
		}
		//generate a JWT token and then use it to get an access token for the dynamic client
		err = sourceCred.RefreshDynamicClientAccessToken()
		if err != nil {
			err = fmt.Errorf("an error occurred while retrieving access token for dynamic client: %w", err)
			logger.Errorln(err)
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
			return
		}
	}

	if sourceCred.ID != uuid.Nil {
		//reconnect
		err := databaseRepo.UpdateSource(c, &sourceCred)
		if err != nil {
			err = fmt.Errorf("an error occurred while reconnecting source credential: %w", err)
			logger.Errorln(err)
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
			return
		}
	} else {
		//create source for the first time
		err := databaseRepo.CreateSource(c, &sourceCred)
		if err != nil {
			err = fmt.Errorf("an error occurred while storing source credential: %w", err)
			logger.Errorln(err)
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
			return
		}
	}

	// after creating the source, we should do a bulk import (in the background)

	summary, err := BackgroundJobSyncResources(GetBackgroundContext(c), logger, databaseRepo, &sourceCred)
	if err != nil {
		logger.Errorln(err)
		//errors from the background job will be wrapped and stored in the database, lets just return a generic error
		// this is also important because these errors:
		// 1. are not user facing - longer/scarier for users, and may show information that they are not equipped to resolve themselves.
		// 2. lots of duplicate text ("an error occurred while...") due to wrapping as the error bubbles up the codebase.
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "initial record sync failed. See background jobs page for more details"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "source": sourceCred, "data": summary})
}

func SourceSync(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)
	eventBus := c.MustGet(pkg.ContextKeyTypeEventBusServer).(event_bus.Interface)

	logger.Infof("Get SourceCredential Credentials: %v", c.Param("sourceId"))

	sourceCred, err := databaseRepo.GetSource(c, c.Param("sourceId"))
	if err != nil {
		err = fmt.Errorf("an error occurred while retrieving source credential: %w", err)
		logger.Errorln(err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	// after creating the source, we should do a bulk import (in the background)
	summary, err := BackgroundJobSyncResources(GetBackgroundContext(c), logger, databaseRepo, sourceCred)
	if err != nil {
		err := fmt.Errorf("an error occurred while syncing resources: %w", err)
		logger.Errorln(err)
		//errors from the background job will be wrapped and stored in the database, lets just return a generic error
		// this is also important because these errors:
		// 1. are not user facing - longer/scarier for users, and may show information that they are not equipped to resolve themselves.
		// 2. lots of duplicate text ("an error occurred while...") due to wrapping as the error bubbles up the codebase.
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "record sync failed. See background jobs page for more details"})
		return
	}

	//publish event
	currentUser, _ := databaseRepo.GetCurrentUser(c)
	err = eventBus.PublishMessage(
		models.NewEventSourceComplete(
			currentUser.ID.String(),
			sourceCred.ID.String(),
		),
	)
	if err != nil {
		logger.Warnf("ignoring: an error occurred while publishing sync complete event: %v", err)
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "source": sourceCred, "data": summary})
}

// mimics functionality in CreateRelatedResources
// mimics functionality in SourceSync
func CreateManualSource(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)
	eventBus := c.MustGet(pkg.ContextKeyTypeEventBusServer).(event_bus.Interface)

	// store the bundle file locally
	bundleFile, err := storeFileLocally(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	// We cannot save the "SourceCredential" object yet, as we do not know the patientID

	// create a "manual" client, which we can use to parse the
	manualSourceCredential := models.SourceCredential{
		PlatformType: sourcePkg.PlatformTypeManual,
	}
	tempSourceClient, err := factory.GetSourceClient("", c, logger, &manualSourceCredential)
	if err != nil {
		err = fmt.Errorf("an error occurred while initializing hub client using manual source without credentials: %w", err)
		logger.Errorln(err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	patientId, bundleType, err := tempSourceClient.ExtractPatientId(bundleFile)
	if err != nil {
		err = fmt.Errorf("an error occurred while extracting patient id: %w", err)
		logger.Errorln(err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	manualSourceCredential.Patient = patientId

	//store the manualSourceCredential
	err = databaseRepo.CreateSource(c, &manualSourceCredential)
	if err != nil {
		err = fmt.Errorf("an error occurred while creating manual source: %w", err)
		logger.Errorln(err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	summary, err := BackgroundJobSyncResourcesWrapper(
		c,
		logger,
		databaseRepo,
		&manualSourceCredential,
		func(
			_backgroundJobContext context.Context,
			_logger *logrus.Entry,
			_databaseRepo database.DatabaseRepository,
			_sourceCred *models.SourceCredential,
		) (sourceModels.SourceClient, sourceModels.UpsertSummary, error) {
			manualSourceClient, err := factory.GetSourceClient("", _backgroundJobContext, _logger, _sourceCred)
			if err != nil {
				resultErr := fmt.Errorf("an error occurred while initializing hub client using manual source with credential: %w", err)
				logger.Errorln(resultErr)
				return manualSourceClient, sourceModels.UpsertSummary{}, resultErr
			}

			summary, err := manualSourceClient.SyncAllBundle(_databaseRepo, bundleFile, bundleType)
			if err != nil {
				resultErr := fmt.Errorf("an error occurred while processing bundle: %w", err)
				logger.Errorln(resultErr)
				return manualSourceClient, sourceModels.UpsertSummary{}, resultErr
			}
			return manualSourceClient, summary, nil
		})

	if err != nil {
		err = fmt.Errorf("an error occurred while storing manual source resources: %w", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	//publish event
	currentUser, _ := databaseRepo.GetCurrentUser(c)
	err = eventBus.PublishMessage(
		models.NewEventSourceComplete(
			currentUser.ID.String(),
			manualSourceCredential.ID.String(),
		),
	)
	if err != nil {
		logger.Warnf("ignoring: an error occurred while publishing sync complete event: %v", err)
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": summary, "source": manualSourceCredential})

}

func GetSource(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	sourceCred, err := databaseRepo.GetSource(c, c.Param("sourceId"))
	if err != nil {
		logger.Errorln("An error occurred while retrieving source credential", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": sourceCred})
}

func GetSourceSummary(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	sourceSummary, err := databaseRepo.GetSourceSummary(c, c.Param("sourceId"))
	if err != nil {
		logger.Errorln("An error occurred while retrieving source summary", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": sourceSummary})
}

func GetDelegatedSourceSummary(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	var req struct {
		OwnerUserID string `json:"ownerUserId"`
		SourceID    string `json:"sourceId"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Errorln("Invalid request payload", err)
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "invalid payload"})
		return
	}

	sourceSummaries, err := databaseRepo.GetDelegatedSourceSummary(c, req.SourceID, req.OwnerUserID)
	if err != nil {
		logger.Errorln("An error occurred while retrieving delegated source summaries", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": sourceSummaries})
}

func ListSource(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	sourceCreds, err := databaseRepo.GetSources(c)
	if err != nil {
		logger.Errorln("An error occurred while listing source credentials", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": sourceCreds})
}

func DeleteSource(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	rowsEffected, err := databaseRepo.DeleteSource(c, c.Param("sourceId"))
	if err != nil {
		logger.Errorln("An error occurred while deleting source credential", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": rowsEffected})
}

// Helpers
func storeFileLocally(c *gin.Context) (*os.File, error) {
	// single file
	file, err := c.FormFile("file")
	if err != nil {
		//c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "could not extract file from form"})
		return nil, fmt.Errorf("could not extract file from form")
	}
	fmt.Printf("Uploaded filename: %s", file.Filename)

	// create a temporary file to store this uploaded file
	bundleFile, err := ioutil.TempFile("", file.Filename)
	if err != nil {
		//c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "could not create temp file"})
		return nil, fmt.Errorf("could not create temp file")
	}

	// Upload the file to specific bundleFile.
	err = c.SaveUploadedFile(file, bundleFile.Name())
	if err != nil {
		//c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "could not save temp file"})
		return nil, fmt.Errorf("could not save temp file")
	}
	return bundleFile, nil
}
