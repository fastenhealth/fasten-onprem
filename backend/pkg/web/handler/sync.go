package handler

import (
	"net/http"
	"reflect"
	"strconv"
	"time"
	"net"
	"os"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/auth"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	databaseModel "github.com/fastenhealth/fasten-onprem/backend/pkg/models/database"
	"github.com/gin-gonic/gin"
	"github.com/iancoleman/strcase"
	"github.com/sirupsen/logrus"
)

// Connection represents server connection information for mobile apps.
type Connection struct {
	Host     string `json:"host"`
	Port     string `json:"port"`
	Protocol string `json:"protocol"`
}

// authenticateAndLogUsage handles common authentication and usage logging for sync endpoints
func authenticateAndLogUsage(c *gin.Context, log *logrus.Entry, databaseRepo database.DatabaseRepository) (*models.User, string, error) {
	// Get current user
	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		log.Errorf("Failed to get current user: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Unauthorized"})
		return nil, "", err
	}

	// Get token from context
	tokenString := c.MustGet(pkg.ContextKeyTypeAuthToken).(string)
	tokenID, err := auth.GetTokenIDFromToken(tokenString)
	if err != nil {
		log.Errorf("Failed to get token ID from token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get token ID"})
		return nil, "", err
	}

	// Update token usage
	err = databaseRepo.UpdateTokenUsage(c, currentUser.ID, tokenID)
	if err != nil {
		log.Errorf("Failed to update token usage: %v", err)
		// Don't fail the request, just log the error
	}

	// Create device sync history
	history := &models.DeviceAccessHistory{
		UserID:    currentUser.ID,
		TokenID:   tokenID,
		DeviceID:  c.GetHeader("User-Agent"),
		EventTime: time.Now(),
		Success:   true,
		UserAgent: c.GetHeader("User-Agent"),
	}
	err = databaseRepo.CreateDeviceAccessHistory(c, history)
	if err != nil {
		log.Errorf("Failed to create device sync history: %v", err)
		// Don't fail the request, just log the error
	}

	return currentUser, tokenID, nil
}

// parseSyncParams parses common sync query parameters
func parseSyncParams(c *gin.Context) (resourceType string, limit int, offset int) {
	resourceType = c.Query("resource_type")
	
	limit = 1000 // Default chunk size
	if limitStr := c.Query("limit"); limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 && parsedLimit <= 5000 {
			limit = parsedLimit
		}
	}

	offset = 0
	if offsetStr := c.Query("offset"); offsetStr != "" {
		if parsedOffset, err := strconv.Atoi(offsetStr); err == nil && parsedOffset >= 0 {
			offset = parsedOffset
		}
	}
	
	return resourceType, limit, offset
}

// getResourceTypeCounts efficiently counts resources for each resource type
func getResourceTypeCounts(c *gin.Context, databaseRepo database.DatabaseRepository, resourceTypes []string) map[string]int {
	resourceTypeCounts := make(map[string]int)
	for _, rt := range resourceTypes {
		resources, err := databaseRepo.QueryResources(c, models.QueryResource{From: rt})
		if err == nil && resources != nil {
			rv := reflect.ValueOf(resources)
			if rv.Kind() == reflect.Slice {
				resourceTypeCounts[rt] = rv.Len()
			}
		}
	}
	return resourceTypeCounts
}

// syncSingleResourceType handles chunked sync for a specific resource type
func syncSingleResourceType(c *gin.Context, log *logrus.Entry, databaseRepo database.DatabaseRepository, resourceType string, limit, offset int) {
	log.Debugf("[background-sync] querying resourceType=%s limit=%d offset=%d", resourceType, limit, offset)
	
	// Query resources for the specific type
	resources, err := databaseRepo.QueryResources(c, models.QueryResource{
		From:   resourceType,
		Limit:  &limit,
		Offset: &offset,
	})
	if err != nil {
		log.Errorf("Failed to get resources of type %s: %v", resourceType, err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get resources"})
		return
	}

	// Convert to slice
	allResources := make([]interface{}, 0)
	if resources != nil {
		rv := reflect.ValueOf(resources)
		if rv.Kind() == reflect.Slice {
			log.Debugf("[background-sync] fetched %d rows for resourceType=%s", rv.Len(), resourceType)
			for i := 0; i < rv.Len(); i++ {
				allResources = append(allResources, rv.Index(i).Interface())
			}
		}
	}

	// Get total count for this resource type
	totalCount := 0
	if totalResources, err := databaseRepo.QueryResources(c, models.QueryResource{From: resourceType}); err == nil && totalResources != nil {
		if rv := reflect.ValueOf(totalResources); rv.Kind() == reflect.Slice {
			totalCount = rv.Len()
		}
	}

	// Pagination info
	hasMore := len(allResources) == limit
	nextOffset := offset + len(allResources)

	log.Debugf("[background-sync] returning resources: total=%d hasMore=%t nextOffset=%d", len(allResources), hasMore, nextOffset)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"resources":    allResources,
			"resourceType": resourceType,
			"total":        len(allResources),
		},
		"pagination": gin.H{
			"hasMore":      hasMore,
			"nextOffset":   nextOffset,
			"limit":        limit,
			"totalCount":   totalCount,
			"resourceType": resourceType,
		},
	})
}

// SyncData handles background sync requests - returns resource types list or chunked resource data
func SyncData(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	// Authenticate and get current user
	_, _, err := authenticateAndLogUsage(c, log, databaseRepo)
	if err != nil {
		return // Error response already sent
	}

	// Parse query parameters
	resourceType, limit, offset := parseSyncParams(c)

	if resourceType != "" {
		// Chunked sync: Return specific resource type data
		syncSingleResourceType(c, log, databaseRepo, resourceType, limit, offset)
		return
	}

	// Background sync initialization: return resource types list for chunked processing
	log.Debug("[background-sync] returning resource types for chunked processing")
	resourceTypes := databaseModel.GetAllowedResourceTypes()
	
	// Get counts for each resource type efficiently
	resourceTypeCounts := getResourceTypeCounts(c, databaseRepo, resourceTypes)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"resourceTypes":  resourceTypes,
			"resourceCounts": resourceTypeCounts,
			"chunkSize":      1000,
			"syncMode":       "background",
		},
	})
}

// GetResourceTypes returns all available FHIR resource types
func GetResourceTypes(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	log.Debug("Getting all resource types")
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    databaseModel.GetAllowedResourceTypes(),
	})
}

// GetLastUpdated returns the last updated timestamp for sync purposes
func GetLastUpdated(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	log.Debug("Attempting to get current user for last updated timestamp")
	_, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		log.Errorf("Failed to get current user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get current user"})
		return
	}
	log.Debug("Successfully retrieved user for last updated timestamp")

	lastUpdated, err := databaseRepo.GetLastUpdatedTimestamp(c)
	if err != nil {
		log.Errorf("Failed to get last updated timestamp: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get last updated timestamp"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"last_updated": lastUpdated,
		},
	})
}

// SyncDataUpdates handles incremental sync updates using background sync approach
func SyncDataUpdates(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	// Authenticate and get current user
	currentUser, _, err := authenticateAndLogUsage(c, log, databaseRepo)
	if err != nil {
		return // Error response already sent
	}

	// Parse 'since' parameter (required for updates)
	sinceStr := c.Query("since")
	if sinceStr == "" {
		log.Error("Missing 'since' query parameter")
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Missing 'since' query parameter"})
		return
	}
	sinceTime, err := time.Parse(time.RFC3339, sinceStr)
	if err != nil {
		log.Errorf("Invalid 'since' format: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid 'since' format, expected RFC3339"})
		return
	}
	
	// Parse common sync parameters
	resourceType, limit, offset := parseSyncParams(c)
	if limit > 2000 {
		limit = 2000 // Cap limit for updates
	}

	// collect upserts and deletions across FHIR tables
	upserts := make([]models.ResourceBase, 0)
	deletions := make([]gin.H, 0)

	// use underlying Gorm client
	gr, ok := databaseRepo.(*database.GormRepository)
	if !ok {
		log.Errorf("database repository is not GormRepository")
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "server misconfiguration"})
		return
	}

	// If resource_type is specified, only query that type
	resourceTypesToQuery := databaseModel.GetAllowedResourceTypes()
	if resourceType != "" {
		// Validate resource type
		found := false
		for _, rt := range resourceTypesToQuery {
			if rt == resourceType {
				found = true
				break
			}
		}
		if !found {
			log.Errorf("Invalid resource type: %s", resourceType)
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid resource type"})
			return
		}
		resourceTypesToQuery = []string{resourceType}
	}

	for _, rt := range resourceTypesToQuery {
		if len(upserts) >= limit && len(deletions) >= limit {
			break
		}
		tableName := strcase.ToSnake("Fhir" + rt)

		// created/updated
		remaining := limit - len(upserts)
		if remaining > 0 {
			var rows []models.ResourceBase
			query := gr.GormClient.WithContext(c).
				Table(tableName).
				Where("user_id = ? AND deleted_at IS NULL AND updated_at > ?", currentUser.ID, sinceTime).
				Order("updated_at ASC").
				Limit(remaining)
			
			if offset > 0 {
				query = query.Offset(offset)
			}
			
			res := query.Find(&rows)
			if res.Error != nil {
				log.Errorf("Failed to query %s: %v", tableName, res.Error)
				c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get resources"})
				return
			}
			if len(rows) > 0 {
				upserts = append(upserts, rows...)
			}
		}

		// deletions
		remaining = limit - len(deletions)
		if remaining > 0 {
			type tomb struct {
				SourceResourceType string     `gorm:"column:source_resource_type"`
				SourceResourceID   string     `gorm:"column:source_resource_id"`
				DeletedAt          *time.Time `gorm:"column:deleted_at"`
			}
			var ts []tomb
			query := gr.GormClient.WithContext(c).
				Table(tableName).
				Select("source_resource_type, source_resource_id, deleted_at").
				Where("user_id = ? AND deleted_at IS NOT NULL AND deleted_at > ?", currentUser.ID, sinceTime).
				Order("deleted_at ASC").
				Limit(remaining)
			
			if offset > 0 {
				query = query.Offset(offset)
			}
			
			res := query.Find(&ts)
			if res.Error != nil {
				log.Errorf("Failed to query deletions %s: %v", tableName, res.Error)
				c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get resources"})
				return
			}
			for _, t := range ts {
				deletions = append(deletions, gin.H{
					"resourceType": t.SourceResourceType,
					"id":           t.SourceResourceID,
					"deletedAt":    t.DeletedAt,
				})
			}
		}
	}

	hasMore := len(upserts) == limit || len(deletions) == limit
	nextOffset := offset + len(upserts) + len(deletions)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"created": upserts,
			"updated": []interface{}{},
			"deleted": deletions,
			"hasMore": hasMore,
			"pagination": gin.H{
				"nextOffset": nextOffset,
				"limit":      limit,
				"resourceType": resourceType,
			},
		},
	})
}

// GetSecureServerDiscovery returns minimal server connection information for mobile apps
func GetSecureServerDiscovery(c *gin.Context) {
	appConfig := c.MustGet(pkg.ContextKeyTypeConfig).(config.Interface)

	serverAddresses := getServerAddresses(c, appConfig)
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"connections": serverAddresses,
			"endpoints": gin.H{
				"sync_data": "/api/secure/sync/data",
				"sync_updates": "/api/secure/sync/updates",
				"access_tokens": "/api/secure/access/tokens",
			},
		},
	})
}

// getServerAddresses returns multiple possible server addresses for network change resilience
func getServerAddresses(c *gin.Context, appConfig config.Interface) []Connection {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	port := appConfig.GetString("web.listen.port")

	var connections []Connection

	// Priority 0: use mDNS hostname
	hostname, err := os.Hostname()
	if err != nil {
		log.Errorf("Failed to get hostname: %v", err)
		// Continue without hostname if there's an error, or handle as appropriate
	} else {
		connections = append(connections, Connection{Host: hostname, Port: port, Protocol: "https"})
	}

	// Priority 1: UPnP discovered IP
	// if upnpHost := appConfig.GetString("upnp.local_ip"); upnpHost != "" {
	// 	connections = append(connections, Connection{Host: upnpHost, Port: port, Protocol: "https"})
	// }

	// Priority 2: Environment variable override (deprecated, but kept for compatibility)
	// if envHost := os.Getenv("FASTEN_EXTERNAL_HOST"); envHost != "" {
	// 	connections = append(connections, Connection{Host: envHost, Port: port, Protocol: "https"})
	// }

	// Priority 3: Headers from reverse proxies
	// X-Forwarded-Host can contain a host:port pair or just a host.
	// We attempt to split it, but if it fails, we use the whole string as the host.
	if forwardedHost := c.GetHeader("X-Forwarded-Host"); forwardedHost != "" {
		host, p, err := net.SplitHostPort(forwardedHost)
		if err != nil {
			host = forwardedHost // If splitting fails, use the whole string as host
			p = port // Use default port if not specified in header
		}
		connections = append(connections, Connection{Host: host, Port: p, Protocol: "https"})
	}
	if realIP := c.GetHeader("X-Real-IP"); realIP != "" {
		connections = append(connections, Connection{Host: realIP, Port: port, Protocol: "https"})
	}

	// Priority 3: All private, non-loopback IP addresses
	if addrs, err := net.InterfaceAddrs(); err == nil {
		for _, addr := range addrs {
			if ipnet, ok := addr.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
				if ip := ipnet.IP.To4(); ip != nil && ip.IsPrivate() {
					connections = append(connections, Connection{Host: ip.String(), Port: port, Protocol: "https"})
				}
			}
		}
	}

	// Final fallback to localhost
	connections = append(connections, Connection{Host: "localhost", Port: port, Protocol: "https"})

	return uniqueConnections(connections)
}

// uniqueConnections removes duplicate Connection entries while preserving order.
func uniqueConnections(conns []Connection) []Connection {
	seen := make(map[string]bool)
	var unique []Connection
	for _, conn := range conns {
		key := net.JoinHostPort(conn.Host, conn.Port) // Use host:port as the unique key
		if !seen[key] {
			seen[key] = true
			unique = append(unique, conn)
		}
	}
	return unique
}
