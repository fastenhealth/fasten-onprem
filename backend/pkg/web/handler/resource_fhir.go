package handler

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"net/http"
	"strconv"
	"strings"
)

func QueryResourceFhir(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	var query models.QueryResource
	if err := c.ShouldBindJSON(&query); err != nil {
		logger.Errorln("An error occurred while parsing queries", err)
		c.JSON(http.StatusBadRequest, gin.H{"success": false})
		return
	}

	queryResults, err := databaseRepo.QueryResources(c, query)
	if err != nil {
		logger.Errorln("An error occurred while querying resources", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}
	//sort by date
	//queryResults = utils.SortResourceListByDate(queryResults)

	c.JSON(http.StatusOK, gin.H{"success": true, "data": queryResults})
}

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
	if len(c.Query("page")) > 0 {
		listResourceQueryOptions.Limit = pkg.ResourceListPageSize //hardcoded number of resources per page
		pageNumb, err := strconv.Atoi(c.Query("page"))
		if err != nil {
			logger.Errorln("An error occurred while calculating page number", err)
			c.JSON(http.StatusInternalServerError, gin.H{"success": false})
			return
		}
		listResourceQueryOptions.Offset = pageNumb * listResourceQueryOptions.Limit
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

// this endpoint retrieves a specific resource by its ID
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
		Resources []*models.ResourceBase `json:"resources"`
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

	var graphOptions models.ResourceGraphOptions
	if err := c.ShouldBindJSON(&graphOptions); err != nil {
		logger.Errorln("An error occurred while parsing resource graph query options", err)
		c.JSON(http.StatusBadRequest, gin.H{"success": false})
		return
	}

	if len(graphOptions.ResourcesIds) == 0 {
		logger.Errorln("No resource ids specified")
		c.JSON(http.StatusBadRequest, gin.H{"success": false})
		return
	}

	resourceListDictionary, err := databaseRepo.GetFlattenedResourceGraph(c, pkg.ResourceGraphType(graphType), graphOptions)
	if err != nil {
		logger.Errorln("An error occurred while retrieving list of resources", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": map[string]interface{}{
		"results": resourceListDictionary,
	}})
}
