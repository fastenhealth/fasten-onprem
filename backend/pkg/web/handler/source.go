package handler

import (
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/database"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/hub"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"net/http"
	"strings"
)

func CreateSource(c *gin.Context) {
	logger := c.MustGet("LOGGER").(*logrus.Entry)
	databaseRepo := c.MustGet("REPOSITORY").(database.DatabaseRepository)

	sourceCred := models.Source{}
	if err := c.ShouldBindJSON(&sourceCred); err != nil {
		logger.Errorln("An error occurred while parsing posted source credential", err)
		c.JSON(http.StatusBadRequest, gin.H{"success": false})
		return
	}

	logger.Infof("Parsed Create Source Credentials Payload: %v", sourceCred)

	err := databaseRepo.CreateSource(c, &sourceCred)
	if err != nil {
		logger.Errorln("An error occurred while storing source credential", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	// after creating the source, we should do a bulk import
	sourceClient, updatedSource, err := hub.NewClient(sourceCred.SourceType, c, nil, logger, sourceCred)
	if err != nil {
		logger.Errorln("An error occurred while initializing hub client using source credential", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}
	if updatedSource != nil {
		err := databaseRepo.CreateSource(c, updatedSource)
		if err != nil {
			logger.Errorln("An error occurred while updating source credential", err)
			c.JSON(http.StatusInternalServerError, gin.H{"success": false})
			return
		}
	}

	err = sourceClient.SyncAll(databaseRepo)
	if err != nil {
		logger.Errorln("An error occurred while bulk import of resources from source", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": sourceCred})
}

func ListSource(c *gin.Context) {
	logger := c.MustGet("LOGGER").(*logrus.Entry)
	databaseRepo := c.MustGet("REPOSITORY").(database.DatabaseRepository)

	sourceCreds, err := databaseRepo.GetSources(c)
	if err != nil {
		logger.Errorln("An error occurred while storing source credential", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": sourceCreds})
}

func RawRequestSource(c *gin.Context) {
	logger := c.MustGet("LOGGER").(*logrus.Entry)
	databaseRepo := c.MustGet("REPOSITORY").(database.DatabaseRepository)

	sources, err := databaseRepo.GetSources(c)
	if err != nil {
		logger.Errorln("An error occurred while storing source credential", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	var foundSource *models.Source
	for _, source := range sources {
		if source.SourceType == pkg.SourceType(c.Param("sourceType")) {
			foundSource = &source
			break
		}
	}

	if foundSource == nil {
		logger.Errorf("Did not source credentials for %s", c.Param("sourceType"))
		c.JSON(http.StatusNotFound, gin.H{"success": false})
		return
	}

	client, updatedSource, err := hub.NewClient(pkg.SourceType(c.Param("sourceType")), c, nil, logger, *foundSource)
	if err != nil {
		logger.Errorf("Could not initialize source client", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}
	if updatedSource != nil {
		err := databaseRepo.CreateSource(c, updatedSource)
		if err != nil {
			logger.Errorln("An error occurred while updating source credential", err)
			c.JSON(http.StatusInternalServerError, gin.H{"success": false})
			return
		}
	}

	var resp map[string]interface{}
	err = client.GetRequest(strings.TrimSuffix(c.Param("path"), "/"), &resp)
	if err != nil {
		logger.Errorf("Error making raw request", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": resp})
}
