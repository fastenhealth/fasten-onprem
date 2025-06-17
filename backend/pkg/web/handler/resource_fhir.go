package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/utils"
	sourceModels "github.com/fastenhealth/fasten-sources/clients/models"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
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

// deprecated - using Manual Resource Wizard instead
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

func UpdateResourceFhir(c *gin.Context) {
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	resourceType := strings.Trim(c.Param("resourceType"), "/")
	resourceId := strings.Trim(c.Param("resourceId"), "/")

	type UpdatePayload struct {
		ResourceRaw json.RawMessage `json:"resource_raw"`
		SortTitle   string          `json:"sort_title"`
		SortDate    string          `json:"sort_date"`
	}
	var payload UpdatePayload
	err := c.ShouldBindJSON(&payload)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "invalid request payload"})
		return
	}

	resource, err := databaseRepo.GetResourceByResourceTypeAndId(c, resourceType, resourceId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "could not find resource"})
		return
	}

	sourceCredential, err := databaseRepo.GetSource(c, resource.SourceID.String())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "could not find Fasten source for resource"})
		return
	}

	resourceToUpsert := sourceModels.RawResourceFhir{
		SourceResourceType: resourceType,
		SourceResourceID: resourceId,
		ResourceRaw: payload.ResourceRaw,
		SortTitle: &payload.SortTitle,
		SortDate: parseDateTimeWithFallback(&payload.SortDate),
	}

	_, updateError := databaseRepo.UpsertRawResource(c, sourceCredential, resourceToUpsert)
	if updateError != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "failed to update resource"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func parseDateTimeWithFallback(dateTime *string) *time.Time {
	if dateTime == nil {
		return nil
	}
	var parsedDateTime time.Time
	var err error
	parsedDateTime, err = time.Parse(time.RFC3339, *dateTime)
	if err != nil {
		parsedDateTime, err = time.Parse("2006-01-02T15:04", *dateTime)
		if err != nil {
			parsedDateTime, err = time.Parse("2006-01-02", *dateTime)
			if err != nil {
				return nil
			}
		}
	}
	return &parsedDateTime
}