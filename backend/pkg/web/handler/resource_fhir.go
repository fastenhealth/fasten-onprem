package handler

import (
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/database"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"net/http"
	"strings"
)

func ListResourceFhir(c *gin.Context) {
	logger := c.MustGet("LOGGER").(*logrus.Entry)
	databaseRepo := c.MustGet("REPOSITORY").(database.DatabaseRepository)

	listResourceQueryOptions := models.ListResourceQueryOptions{}
	if len(c.Query("sourceResourceType")) > 0 {
		listResourceQueryOptions.SourceResourceType = c.Query("sourceResourceType")
	}
	if len(c.Query("sourceID")) > 0 {
		listResourceQueryOptions.SourceID = c.Query("sourceID")
	}

	wrappedResourceModels, err := databaseRepo.ListResources(c, listResourceQueryOptions)

	if err != nil {
		logger.Errorln("An error occurred while retrieving resources", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": wrappedResourceModels})
}

//this endpoint retrieves a specific resource by its ID
func GetResourceFhir(c *gin.Context) {
	logger := c.MustGet("LOGGER").(*logrus.Entry)
	databaseRepo := c.MustGet("REPOSITORY").(database.DatabaseRepository)

	resourceId := strings.Trim(c.Param("resourceId"), "/")
	sourceId := strings.Trim(c.Param("sourceId"), "/")
	wrappedResourceModel, err := databaseRepo.GetResourceBySourceId(c, sourceId, resourceId)

	if err != nil {
		logger.Errorln("An error occurred while retrieving resource", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": wrappedResourceModel})
}
