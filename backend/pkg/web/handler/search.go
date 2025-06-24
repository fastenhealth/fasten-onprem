package handler

import (
	"fmt"
	"net/http"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	typesenseClient "github.com/fastenhealth/fasten-onprem/backend/pkg/search"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type GormRepository struct {
	*database.GormRepository
}

func SearchResourcesHandler(c *gin.Context) {
	// Get logger from context or use a default one
	logger := logrus.WithFields(logrus.Fields{
		"handler": "SearchResourcesHandler",
		"path":    c.Request.URL.Path,
		"method":  c.Request.Method,
		"ip":      c.ClientIP(),
	})

	logger.Info("Search request started")

	query := c.Query("q")
	resourceTypeFilter := c.Query("type")
	if query == "" {
		logger.Warn("Missing required query parameter 'q'")
		c.JSON(http.StatusBadRequest, gin.H{"error": "query parameter 'q' is required"})
		return
	}

	logger.Debug("Checking Typesense client availability")
	if typesenseClient.Client == nil {
		logger.Error("Typesense client is not initialized")
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "search service unavailable"})
		return
	}

	logger.Debug("Creating search client")
	searchClient := &typesenseClient.SearchClient{Client: typesenseClient.Client}

	if searchClient == nil {
		logger.Error("Failed to create search client")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	logger.WithFields(logrus.Fields{
		"query": query,
		"type":  resourceTypeFilter,
	}).Info("Executing search query")

	// Only pass the filter if it's not empty
	var filterPtr *string
	if resourceTypeFilter != "" {
		filterPtr = &resourceTypeFilter
		logger.WithField("filter", resourceTypeFilter).Debug("Using resource type filter")
	} else {
		logger.Debug("No resource type filter provided - searching all types")
	}

	results, err := searchClient.SearchResources(query, filterPtr)
	if err != nil {
		logger.WithError(err).Error("Search query failed")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	logger.WithFields(logrus.Fields{
		"resultCount": len(results),
		"resultType":  fmt.Sprintf("%T", results),
	}).Info("Search query completed successfully")

	c.JSON(http.StatusOK, results)
}
