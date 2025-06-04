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

	// get resource models
	encounter, err := databaseRepo.GetResourceByResourceTypeAndId(c, "Encounter", encounterId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "could not find encounter"})
		return
	}
	relatedResource, err := databaseRepo.GetResourceByResourceTypeAndId(c, resourceType, resourceId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "could not find related resource"})
		return
	}

	// get source credential models
	encounterSourceCredential, err := databaseRepo.GetSource(c, encounter.SourceID.String())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "could not find Fasten source for encounter"})
		return
	}
	resourceSourceCredential, err := databaseRepo.GetSource(c, relatedResource.SourceID.String())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "could not find Fasten source for related resource"})
		return
	}

	var associationsToRemove []models.RelatedResource

	// first add the possible direct/primary associations between the encounter and the resource
	associationsToRemove = append(associationsToRemove, models.RelatedResource{
		ResourceBaseUserID:                encounterSourceCredential.UserID,
		ResourceBaseSourceID:              encounterSourceCredential.ID,
		ResourceBaseSourceResourceType:    "Encounter",
		ResourceBaseSourceResourceID:      encounterId,
		RelatedResourceUserID:             resourceSourceCredential.UserID,
		RelatedResourceSourceID:           resourceSourceCredential.ID,
		RelatedResourceSourceResourceType: resourceType,
		RelatedResourceSourceResourceID:   resourceId,
	})
	associationsToRemove = append(associationsToRemove, models.RelatedResource{
		ResourceBaseUserID:                resourceSourceCredential.UserID,
		ResourceBaseSourceID:              resourceSourceCredential.ID,
		ResourceBaseSourceResourceType:    resourceType,
		ResourceBaseSourceResourceID:      resourceId,
		RelatedResourceUserID:             encounterSourceCredential.UserID,
		RelatedResourceSourceID:           encounterSourceCredential.ID,
		RelatedResourceSourceResourceType: "Encounter",
		RelatedResourceSourceResourceID:   encounterId,
	})

	// now we need to add the secondary associations that link the encounter and the resource
	// Encounter -> X or Encounter <- X, where Resource -> X or Resource <- X
	encounterAssociations, err := databaseRepo.FindAllResourceAssociations(c, encounterSourceCredential, "Encounter", encounterId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "could not get all relations for the encounter"})
		return
	}
	resourceAssociations, err := databaseRepo.FindAllResourceAssociations(c, resourceSourceCredential, resourceType, resourceId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "could not get all relations for the related resource"})
		return
	}

	encounterNeighborsMap := buildNeighborsMapFromAssociations(encounterAssociations, encounterId, "Encounter")
	resourceNeighborsMap := buildNeighborsMapFromAssociations(resourceAssociations, resourceId, resourceType)

	for key := range resourceNeighborsMap {
		if relation, ok := encounterNeighborsMap[key]; ok {
			associationsToRemove = append(associationsToRemove, relation)
		}
	}

	rowsAffected, err := databaseRepo.RemoveBulkResourceAssociations(c, associationsToRemove)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "could not remove resource associations"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "rowsAffected": rowsAffected})
}

func buildNeighborsMapFromAssociations(associations []models.RelatedResource, resourceId string, resourceType string) map[string]models.RelatedResource {
	resourceNeighborsMap := make(map[string]models.RelatedResource)
	for _, association := range associations {
		var key string
		if association.ResourceBaseSourceResourceID == resourceId && association.ResourceBaseSourceResourceType == resourceType {
			key = fmt.Sprintf("%s-%s-%s", association.RelatedResourceSourceID, association.RelatedResourceSourceResourceType, association.RelatedResourceSourceResourceID)
		} else {
			key = fmt.Sprintf("%s-%s-%s", association.ResourceBaseSourceID, association.ResourceBaseSourceResourceType, association.ResourceBaseSourceResourceID)
		}
		resourceNeighborsMap[key] = association
	}

	return resourceNeighborsMap
}
