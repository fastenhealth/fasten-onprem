package handler

import (
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/database"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"net/http"
	"strings"
)

func ListResourceFhir(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	listResourceQueryOptions := models.ListResourceQueryOptions{}
	if len(c.Query("sourceResourceType")) > 0 {
		listResourceQueryOptions.SourceResourceType = c.Query("sourceResourceType")
	}
	if len(c.Query("sourceID")) > 0 {
		listResourceQueryOptions.SourceID = c.Query("sourceID")
	}
	if len(c.Query("sourceResourceID")) > 0 {
		listResourceQueryOptions.SourceResourceID = c.Query("sourceResourceID")
	}
	if len(c.Query("preloadRelated")) > 0 {
		listResourceQueryOptions.PreloadRelated = true
	}

	wrappedResourceModels, err := databaseRepo.ListResources(c, listResourceQueryOptions)

	if c.Query("sortBy") == "title" {
		wrappedResourceModels = utils.SortResourceListByTitle(wrappedResourceModels)
	} else {
		wrappedResourceModels = utils.SortResourceListByDate(wrappedResourceModels)
	}

	if err != nil {
		logger.Errorln("An error occurred while retrieving resources", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": wrappedResourceModels})
}

//this endpoint retrieves a specific resource by its ID
func GetResourceFhir(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

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

func CreateResourceComposition(c *gin.Context) {

	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	type jsonPayload struct {
		Resources []*models.ResourceFhir `json:"resources"`
		Title     string                 `json:"title"`
	}
	var payload jsonPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		logger.Errorln("An error occurred while parsing posted resources & title", err)
		c.JSON(http.StatusBadRequest, gin.H{"success": false})
		return
	}
	err := databaseRepo.AddResourceComposition(c, payload.Title, payload.Resources)
	if err != nil {
		logger.Errorln("An error occurred while creating resource group (composition)", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

// GetResourceFhirGraph
// Retrieve a list of all fhir resources (vertex), and a list of all associations (edge)
// Generate a graph
// find the PredecessorMap
// - filter to only vertices that are "Condition" or "Encounter" and are "root" nodes (have no edges directed to this node)
func GetResourceFhirGraph(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	graphType := strings.Trim(c.Param("graphType"), "/")

	resourceListDictionary, err := databaseRepo.GetFlattenedResourceGraph(c, pkg.ResourceGraphType(graphType))
	if err != nil {
		logger.Errorln("An error occurred while retrieving list of resources", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": resourceListDictionary})
}
