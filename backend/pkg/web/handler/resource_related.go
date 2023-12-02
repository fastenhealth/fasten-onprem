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
	"github.com/sirupsen/logrus"
	"io/ioutil"
	"net/http"
)

// mimics functionality in CreateManualSource
func CreateRelatedResources(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)
	eventBus := c.MustGet(pkg.ContextKeyTypeEventBusServer).(event_bus.Interface)

	//step 1: extract the file from the form
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

	//step 2: find a reference to the Fasten source for this user
	sourceCredentials, err := databaseRepo.GetSources(c)
	var fastenSourceCredential *models.SourceCredential
	for _, sourceCredential := range sourceCredentials {
		if sourceCredential.SourceType == sourcePkg.SourceTypeFasten {
			fastenSourceCredential = &sourceCredential
			break
		}
	}
	if fastenSourceCredential == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "could not find Fasten source for this user"})
		return
	}

	//step 3: create a "fasten" client, which we can use to parse resources to add to the database
	fastenSourceClient, err := factory.GetSourceClient(sourcePkg.GetFastenLighthouseEnv(), sourcePkg.SourceTypeFasten, c, logger, fastenSourceCredential)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "could not create Fasten source client"})
		return
	}

	//step 4: parse the resources from the bundle
	summary, err := fastenSourceClient.SyncAllBundle(databaseRepo, bundleFile, sourcePkg.FhirVersion401)
	//TODO: summary, err := fastenSourceClient.CreateRelatedResources(databaseRepo, rootResource, bundleFile, sourcePkg.FhirVersion401)
	if err != nil {
		logger.Errorln("An error occurred while processing bundle", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	//step 7 notify the event bus of the new resources
	currentUser, _ := databaseRepo.GetCurrentUser(c)

	err = eventBus.PublishMessage(
		models.NewEventSourceComplete(
			currentUser.ID.String(),
			fastenSourceCredential.ID.String(),
		),
	)

	if err != nil {
		logger.Warnf("ignoring: an error occurred while publishing sync complete event: %v", err)
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": summary, "source": fastenSourceCredential})

}
