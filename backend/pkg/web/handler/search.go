package handler

import (
	"net/http"
	"strconv"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	typesenseClient "github.com/fastenhealth/fasten-onprem/backend/pkg/search"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type GormRepository struct {
	*database.GormRepository
}

func SearchResourcesHandler(c *gin.Context) {
	logger := logrus.WithFields(logrus.Fields{
		"handler": "SearchResourcesHandler",
		"path":    c.Request.URL.Path,
		"method":  c.Request.Method,
		"ip":      c.ClientIP(),
	})

	logger.Info("Search request started")

	query := c.Query("q")
	resourceTypeFilter := c.Query("type")
	pageStr := c.DefaultQuery("page", "1")
	perPageStr := c.DefaultQuery("per_page", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	perPage, err := strconv.Atoi(perPageStr)
	if err != nil || perPage < 1 || perPage > 250 {
		perPage = 10
	}

	if query == "" {
		logger.Warn("Missing required query parameter 'q'")
		c.JSON(http.StatusBadRequest, gin.H{"error": "query parameter 'q' is required"})
		return
	}

	if typesenseClient.Client == nil {
		logger.Error("Typesense client is not initialized")
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "search service unavailable"})
		return
	}

	searchClient := &typesenseClient.SearchClient{Client: typesenseClient.Client}

	var filterPtr *string
	if resourceTypeFilter != "" {
		filterPtr = &resourceTypeFilter
		logger.WithField("filter", resourceTypeFilter).Debug("Using resource type filter")
	} else {
		logger.Debug("No resource type filter provided - searching all types")
	}

	results, total, err := searchClient.SearchResources(query, filterPtr, page, perPage)
	if err != nil {
		logger.WithError(err).Error("Search query failed")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	logger.WithFields(logrus.Fields{
		"resultCount": len(results),
		"totalFound":  total,
		"page":        page,
		"perPage":     perPage,
	}).Info("Search query completed successfully")

	c.JSON(http.StatusOK, gin.H{
		"results":  results,
		"total":    total,
		"page":     page,
		"per_page": perPage,
	})
}
