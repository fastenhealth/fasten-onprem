package handler

import (
	"fmt"
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/fastenhealth/fasten-sources/clients/factory"
	sourcePkg "github.com/fastenhealth/fasten-sources/pkg"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"io/ioutil"
	"net/http"
)

func CreateReconnectSource(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	sourceCred := models.SourceCredential{}
	if err := c.ShouldBindJSON(&sourceCred); err != nil {
		logger.Errorln("An error occurred while parsing posted source credential", err)
		c.JSON(http.StatusBadRequest, gin.H{"success": false})
		return
	}

	logger.Infof("Parsed Create SourceCredential Credentials Payload: %v", sourceCred)

	if sourceCred.DynamicClientRegistrationMode == "user-authenticated" {
		logger.Warnf("This client requires a dynamice client registration, starting registration process")

		if len(sourceCred.RegistrationEndpoint) == 0 {
			logger.Errorln("Empty registration endpoint, cannot be used with dynamic-client registration mode:", sourceCred.DynamicClientRegistrationMode)
			c.JSON(http.StatusBadRequest, gin.H{"success": false})
			return
		}

		err := sourceCred.RegisterDynamicClient()
		if err != nil {
			logger.Errorln("An error occurred while registering dynamic client", err)
			c.JSON(http.StatusBadRequest, gin.H{"success": false})
			return
		}
		//generate a JWT token and then use it to get an access token for the dynamic client
		err = sourceCred.RefreshDynamicClientAccessToken()
		if err != nil {
			logger.Errorln("An error occurred while retrieving access token for dynamic client", err)
			c.JSON(http.StatusBadRequest, gin.H{"success": false})
			return
		}
	}

	if sourceCred.ID != uuid.Nil {
		//reconnect
		err := databaseRepo.UpdateSource(c, &sourceCred)
		if err != nil {
			logger.Errorln("An error occurred while reconnecting source credential", err)
			c.JSON(http.StatusInternalServerError, gin.H{"success": false})
			return
		}
	} else {
		//create source for the first time
		err := databaseRepo.CreateSource(c, &sourceCred)
		if err != nil {
			logger.Errorln("An error occurred while storing source credential", err)
			c.JSON(http.StatusInternalServerError, gin.H{"success": false})
			return
		}
	}

	// after creating the source, we should do a bulk import (in the background)

	summary, err := BackgroundJobSyncResources(GetBackgroundContext(c), logger, databaseRepo, &sourceCred)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
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
		logger.Errorln("An error occurred while retrieving source credential", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	// after creating the source, we should do a bulk import (in the background)
	summary, err := BackgroundJobSyncResources(GetBackgroundContext(c), logger, databaseRepo, sourceCred)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
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

func CreateManualSource(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)
	eventBus := c.MustGet(pkg.ContextKeyTypeEventBusServer).(event_bus.Interface)

	// single file
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "could not extract file from form"})
		return
	}
	fmt.Printf("Uploaded filename: %s", file.Filename)

	// create a temporary file to store this uploaded file
	bundleFile, err := ioutil.TempFile("", file.Filename)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "could not create temp file"})
		return
	}

	// Upload the file to specific bundleFile.
	err = c.SaveUploadedFile(file, bundleFile.Name())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "could not save temp file"})
		return
	}

	// We cannot save the "SourceCredential" object yet, as we do not know the patientID

	// create a "manual" client, which we can use to parse the
	manualSourceCredential := models.SourceCredential{
		SourceType: sourcePkg.SourceTypeManual,
	}
	tempSourceClient, err := factory.GetSourceClient(sourcePkg.GetFastenLighthouseEnv(), sourcePkg.SourceTypeManual, c, logger, &manualSourceCredential)
	if err != nil {
		logger.Errorln("An error occurred while initializing hub client using manual source without credentials", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	patientId, bundleType, err := tempSourceClient.ExtractPatientId(bundleFile)
	if err != nil {
		logger.Errorln("An error occurred while extracting patient id", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	manualSourceCredential.Patient = patientId

	//store the manualSourceCredential
	err = databaseRepo.CreateSource(c, &manualSourceCredential)
	if err != nil {
		logger.Errorln("An error occurred while creating manual source", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	manualSourceClient, err := factory.GetSourceClient(sourcePkg.GetFastenLighthouseEnv(), sourcePkg.SourceTypeManual, c, logger, &manualSourceCredential)
	if err != nil {
		logger.Errorln("An error occurred while initializing hub client using manual source with credential", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	summary, err := manualSourceClient.SyncAllBundle(databaseRepo, bundleFile, bundleType)
	if err != nil {
		logger.Errorln("An error occurred while processing bundle", err)
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
