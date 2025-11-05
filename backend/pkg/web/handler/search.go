package handler

import (
	"net/http"
	"strconv"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/search"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

type GormRepository struct {
	*database.GormRepository
}

type ResourceTypeCount struct {
	Count        int    `json:"count"`
	ResourceType string `json:"resource_type"`
}

func SearchResourcesHandler(c *gin.Context) {
	logger := logrus.WithFields(logrus.Fields{
		"handler": "SearchResourcesHandler",
		"path":    c.Request.URL.Path,
		"method":  c.Request.Method,
		"ip":      c.ClientIP(),
	})

	logger.Info("Search request started")

	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	currentUser, err := databaseRepo.GetCurrentUser(c)

	if err != nil {
		logger.WithError(err).Error("Failed to get current user, data will not be filtered by user")
	}

	query := c.DefaultQuery("q", "*") // Default to wildcard search if no query is provided
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

	if search.Client == nil {
		logger.Error("Search client is not initialized")
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "search service unavailable"})
		return
	}

	indexer := &search.IndexerService{Client: search.Client}

	var filterPtr *string
	if resourceTypeFilter != "" {
		filterPtr = &resourceTypeFilter
		logger.WithField("filter", resourceTypeFilter).Debug("Using resource type filter")
	} else {
		logger.Debug("No resource type filter provided - searching all types")
	}

	var userIDStrPtr *string
	if currentUser.ID != (uuid.UUID{}) {
		idStr := currentUser.ID.String()
		userIDStrPtr = &idStr
	}
	results, total, err := indexer.SearchResources(query, filterPtr, userIDStrPtr, page, perPage)
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

func GetResourceByIDHandler(c *gin.Context) {
	logger := logrus.WithFields(logrus.Fields{
		"handler": "GetResourceByIDHandler",
		"path":    c.Request.URL.Path,
		"method":  c.Request.Method,
		"ip":      c.ClientIP(),
	})

	resourceID := c.Param("id")
	logger = logger.WithField("resourceID", resourceID)
	logger.Info("Fetching single resource by ID")

	if search.Client == nil {
		logger.Error("Search client is not initialized")
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "search service unavailable"})
		return
	}

	indexer := &search.IndexerService{Client: search.Client}

	resource, err := indexer.GetResourceByID(resourceID)
	if err != nil {
		logger.WithError(err).Error("Failed to retrieve resource")
		c.JSON(http.StatusNotFound, gin.H{"error": "resource not found"})
		return
	}

	logger.Info("Resource retrieved successfully")

	c.JSON(http.StatusOK, gin.H{
		"resource": resource,
	})
}

func GetResourceSummaryHandler(c *gin.Context) {
	logger := logrus.WithFields(logrus.Fields{
		"handler": "SearchResourcesHandler",
		"path":    c.Request.URL.Path,
		"method":  c.Request.Method,
		"ip":      c.ClientIP(),
	})

	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	currentUser, err := databaseRepo.GetCurrentUser(c)

	if err != nil {
		logger.WithError(err).Error("Failed to get current user, data will not be filtered by user")
	}

	logger.Info("Resource summary request started")
	if search.Client == nil {
		logger.Error("Search client is not initialized")
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "search service unavailable"})
		return
	}

	indexer := &search.IndexerService{Client: search.Client}

	perPage := 250
	page := 1
	counts := map[string]int{}
	var totalCount int

	var userIDStrPtr *string
	if currentUser.ID != (uuid.UUID{}) {
		idStr := currentUser.ID.String()
		userIDStrPtr = &idStr
	}

	for {
		results, total, err := indexer.SearchResources("*", nil, userIDStrPtr, page, perPage)
		logger.WithFields(logrus.Fields{
			"page":        page,
			"perPage":     perPage,
			"total":       total,
			"resultCount": len(results),
		}).Info("Fetching resource type counts")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Set total count once (since Typesense returns total count for full match)
		if page == 1 {
			totalCount = total
		}

		// Count resource types in current page of results
		for _, hit := range results {
			if val, ok := hit["source_resource_type"]; ok {
				if rt, ok := val.(string); ok {
					counts[rt]++
				}
			}
		}

		if page*perPage >= total {
			break
		}
		page++
	}

	// Add "all" entry
	counts["All"] = totalCount

	var results []ResourceTypeCount
	for rt, count := range counts {
		results = append(results, ResourceTypeCount{
			Count:        count,
			ResourceType: rt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"resource_type_counts": results,
		"total":                len(results),
	})
}
