package handler

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/fastenhealth/fasten-sources/clients/factory"
	sourceModels "github.com/fastenhealth/fasten-sources/clients/models"
	sourcePkg "github.com/fastenhealth/fasten-sources/pkg"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// mimics functionality in CreateManualSource
func CreateRelatedResources(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)
	eventBus := c.MustGet(pkg.ContextKeyTypeEventBusServer).(event_bus.Interface)

	// store the bundle file locally
	bundleFile, err := storeFileLocally(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	//step 2: find a reference to the Fasten source for this user
	sourceCredentials, err := databaseRepo.GetSources(c)
	var fastenSourceCredential *models.SourceCredential
	for _, sourceCredential := range sourceCredentials {
		if sourceCredential.PlatformType == sourcePkg.PlatformTypeFasten {
			fastenSourceCredential = &sourceCredential
			break
		}
	}
	if fastenSourceCredential == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "could not find Fasten source for this user"})
		return
	}

	summary, err := BackgroundJobSyncResourcesWrapper(
		c,
		logger,
		databaseRepo,
		fastenSourceCredential,
		func(
			_backgroundJobContext context.Context,
			_logger *logrus.Entry,
			_databaseRepo database.DatabaseRepository,
			_sourceCred *models.SourceCredential,
		) (sourceModels.SourceClient, sourceModels.UpsertSummary, error) {

			//step 3: create a "fasten" client, which we can use to parse resources to add to the database
			fastenSourceClient, err := factory.GetSourceClient(sourcePkg.GetFastenLighthouseEnv(), _backgroundJobContext, _logger, _sourceCred)
			if err != nil {
				resultErr := fmt.Errorf("could not create Fasten source client")
				_logger.Errorln(resultErr)
				return fastenSourceClient, sourceModels.UpsertSummary{}, resultErr
			}

			//step 4: parse the resources from the bundle
			summary, err := fastenSourceClient.SyncAllBundle(_databaseRepo, bundleFile, sourcePkg.FhirVersion401)
			if err != nil {
				resultErr := fmt.Errorf("an error occurred while processing bundle: %v", err)
				_logger.Errorln(resultErr)
				return fastenSourceClient, summary, resultErr
			}
			return fastenSourceClient, summary, nil
		})

	if err != nil {
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

func EncounterUnlinkResource(c *gin.Context) {
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	encounterId := strings.Trim(c.Param("encounterId"), "/")
	resourceId := strings.Trim(c.Param("resourceId"), "/")
	resourceType := strings.Trim(c.Param("resourceType"), "/")

	rowsAffected, err := databaseRepo.UnlinkResourceWithSharedNeighbors(c, "Encounter", encounterId, resourceType, resourceId)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "rowsAffected": rowsAffected})
}
