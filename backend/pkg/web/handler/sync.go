package handler

import (
        "time"
        "crypto/rand"
        "encoding/hex"
	"encoding/json"
	"fmt"
	"net"
	"net/http"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/auth"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	databaseModel "github.com/fastenhealth/fasten-onprem/backend/pkg/models/database"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func InitiateSync(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)
	appConfig := c.MustGet(pkg.ContextKeyTypeConfig).(config.Interface)

	log.Debug("Attempting to get current user for sync initiation")
	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		log.Errorf("Failed to get current user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get current user"})
		return
	}
	log.Debugf("Successfully retrieved user: %s", currentUser.Username)

	// Generate unique token ID  
	tokenIDBytes := make([]byte, 16)
	rand.Read(tokenIDBytes)
	tokenID := hex.EncodeToString(tokenIDBytes)

	// Get client info
	userAgent := c.GetHeader("User-Agent")
	
	// Generate sync token with 24-hour expiration
	now := time.Now()
	expiresAt := now.Add(24 * time.Hour)
	
	syncToken, err := auth.JwtGenerateSyncToken(*currentUser, appConfig.GetString("jwt.issuer.key"), expiresAt, tokenID, userAgent)
	if err != nil {
		log.Errorf("Failed to generate sync token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	// Store token metadata in database  
	tokenHash := database.HashToken(syncToken)
	serverAddress, serverPort := getServerAddress(c, appConfig)
	
	dbSyncToken := &models.SyncToken{
		UserID:      currentUser.ID,
		TokenID:     tokenID,
		TokenHash:   tokenHash,
		Name:        fmt.Sprintf("Mobile Sync - %s", time.Now().Format("Jan 2, 2006")),
		Description: "Sync token for Health Wallet mobile app",
		UserAgent:   userAgent,
		IssuedAt:    now,
		ExpiresAt:   expiresAt,
		IsActive:    true,
		IsRevoked:   false,
		ServerName:  fmt.Sprintf("Fasten Health Server (%s:%s)", serverAddress, serverPort),
		ServerHost:  serverAddress,
		ServerPort:  serverPort,
		Scopes:      "sync:read,sync:write",
	}

	err = databaseRepo.CreateSyncToken(c, dbSyncToken)
	if err != nil {
		log.Errorf("Failed to store sync token: %v", err)
		// Still return the token even if storage fails
	}

	log.Debug("Successfully generated sync token")

	// Get multiple server addresses for network resilience
	serverAddresses := getServerAddresses(c, appConfig)
	primaryAddress, serverPort := getServerAddress(c, appConfig)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"token":   syncToken,
			"port":    serverPort,
			"address": primaryAddress,
			"addresses": serverAddresses, // Multiple addresses for network resilience
			"serverInfo": gin.H{
				"name":    "Fasten Health Server",
				"version": "1.0.0",
				"docker":  true,
			},
			"expiresAt": expiresAt.Format(time.RFC3339),
			"tokenId":   tokenID,
			// Additional fields for frontend compatibility
			"serverName": fmt.Sprintf("Fasten Health Server (%s:%s)", primaryAddress, serverPort),
		},
	})
}

// getClientIP gets the client IP address
func getClientIP(c *gin.Context) string {
	if ip := c.GetHeader("X-Forwarded-For"); ip != "" {
		return ip
	}
	if ip := c.GetHeader("X-Real-IP"); ip != "" {
		return ip
	}
	return c.ClientIP()
}

// getServerAddress gets the server address and port, prioritizing non-local addresses
func getServerAddress(c *gin.Context, appConfig config.Interface) (string, string) {
	// Get the port from the app config
	port := appConfig.GetString("web.listen.port")

	// Priority 1: UPnP discovered IP
	if upnpHost := appConfig.GetString("upnp.local_ip"); upnpHost != "" {
		return upnpHost, port
	}

	// Priority 2: Environment variable override (deprecated, but kept for compatibility)
	//if envHost := os.Getenv("FASTEN_EXTERNAL_HOST"); envHost != "" {
	//	return envHost, externalPort
	//}

	// Priority 3: Headers from reverse proxies
	if forwardedHost := c.GetHeader("X-Forwarded-Host"); forwardedHost != "" {
		if host, _, err := net.SplitHostPort(forwardedHost); err == nil {
			return host, externalPort
		}
		return forwardedHost, externalPort
	}
	if realIP := c.GetHeader("X-Real-IP"); realIP != "" {
		return realIP, externalPort
	}

	// Priority 3: Detect a private, non-loopback IP address
	// In a Docker container, this will be the container's IP, which is not what we want.
	// However, we will return all possible IPs in getServerAddresses, so the client can try them all.
	// For the primary address, we'll prefer a private IP, but fallback gracefully.
	if addrs, err := net.InterfaceAddrs(); err == nil {
		for _, addr := range addrs {
			if ipnet, ok := addr.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
				if ip := ipnet.IP.To4(); ip != nil && ip.IsPrivate() {
					return ip.String(), externalPort
				}
			}
		}
	}

	// Final fallback to localhost
	return "localhost", port
}

// getServerAddresses returns multiple possible server addresses for network change resilience
func getServerAddresses(c *gin.Context, appConfig config.Interface) []string {
	port := appConfig.GetString("web.listen.port")

	// Use a map to automatically handle uniqueness and a slice to maintain order
	seen := make(map[string]bool)
	var addresses []string

	addAddress := func(addr string) {
		if addr != "" && !seen[addr] {
			seen[addr] = true
			addresses = append(addresses, addr)
		}
	}

	// Priority 1: UPnP discovered IP
	if upnpHost := appConfig.GetString("upnp.local_ip"); upnpHost != "" {
		addAddress(fmt.Sprintf("%s:%s", upnpHost, port))
	}

	// Priority 2: Environment variable override (deprecated, but kept for compatibility)
	//if envHost := os.Getenv("FASTEN_EXTERNAL_HOST"); envHost != "" {
	//	addAddress(fmt.Sprintf("%s:%s", envHost, port))
	//}

	// Priority 3: Headers from reverse proxies
	if forwardedHost := c.GetHeader("X-Forwarded-Host"); forwardedHost != "" {
		if host, _, err := net.SplitHostPort(forwardedHost); err == nil {
			addAddress(fmt.Sprintf("%s:%s", host, port))
		} else {
			addAddress(fmt.Sprintf("%s:%s", forwardedHost, port))
		}
	}
	if realIP := c.GetHeader("X-Real-IP"); realIP != "" {
		addAddress(fmt.Sprintf("%s:%s", realIP, port))
	}

	// Priority 3: All private, non-loopback IP addresses
	if addrs, err := net.InterfaceAddrs(); err == nil {
		for _, addr := range addrs {
			if ipnet, ok := addr.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
				if ip := ipnet.IP.To4(); ip != nil && ip.IsPrivate() {
					addAddress(fmt.Sprintf("%s:%s", ip.String(), port))
				}
			}
		}
	}

	// Final fallback to localhost
	addAddress(fmt.Sprintf("localhost:%s", port))

	return addresses
}


func SyncData(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	// The JWT is passed in the Authorization header, so we can use the existing GetCurrentUser middleware
	log.Debug("Attempting to get current user for sync data")
	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		log.Errorf("Failed to get current user: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Unauthorized"})
		return
	}

	//get the token from the context
	tokenString := c.MustGet(pkg.ContextKeyTypeAuthToken).(string)
	tokenID, err := auth.GetTokenIDFromToken(tokenString)
	if err != nil {
		log.Errorf("Failed to get token ID from token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get token ID"})
		return
	}

	// Update token usage
	err = databaseRepo.UpdateTokenUsage(c, currentUser.ID, tokenID)
	if err != nil {
		log.Errorf("Failed to update token usage: %v", err)
		// Don't fail the request, just log the error
	}

	// Create device sync history
	history := &models.DeviceSyncHistory{
		UserID:    currentUser.ID,
		TokenID:   tokenID,
		DeviceID:  c.GetHeader("User-Agent"),
		Success:   true,
	}
	err = databaseRepo.CreateDeviceSyncHistory(c, history)
	if err != nil {
		log.Errorf("Failed to create device sync history: %v", err)
		// Don't fail the request, just log the error
	}

	log.Debug("Successfully retrieved user for sync data")
	// an empty query will return all resources for the user
	log.Debug("Querying all resources for user")
	allResources := make([]interface{}, 0)
	for _, resourceType := range databaseModel.GetAllowedResourceTypes() {
		resources, err := databaseRepo.QueryResources(c, models.QueryResource{
			From: resourceType,
		})
		if err != nil {
			log.Errorf("Failed to get resources of type %s: %v", resourceType, err)
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get resources"})
			return
		}

		if resources != nil {
			for _, r := range resources.([]models.ResourceBase) {
				allResources = append(allResources, r)
			}
		}
	}
	log.Debugf("Successfully retrieved %d resources", len(allResources))

	bundle := models.FhirBundle{
		ResourceType: "Bundle",
		Type:         "collection",
		Total:        len(allResources),
		Entry:        make([]models.BundleEntry, len(allResources)),
	}

	for i, resource := range allResources {
		bundle.Entry[i] = models.BundleEntry{
			Resource: resource,
		}
	}

	// ---- ADD THIS CODE FOR DEBUGGING ----
	bundleBytes, _ := json.MarshalIndent(bundle, "", "  ")
	fmt.Println("--- BEGIN DEBUG BUNDLE ---")
	fmt.Println(string(bundleBytes))
	fmt.Println("--- END DEBUG BUNDLE ---")
	// ------------------------------------

	c.JSON(http.StatusOK, bundle)

	// publish the event
	// err = eventBus.PublishMessage(models.NewEvent(models.EventTypeSourceSyncComplete, gin.H{
	// 	"success": true,
	// 	"token_id": tokenID,
	// }))
	// if err != nil {
	// 	log.Errorf("Failed to publish sync complete event: %v", err)
	// }
}

func GetResourceTypes(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	log.Debug("Getting all resource types")
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    databaseModel.GetAllowedResourceTypes(),
	})
}

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

func SyncDataUpdates(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	log.Debug("Attempting to get current user for sync data updates")
	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		log.Errorf("Failed to get current user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get current user"})
		return
	}
	log.Debug("Successfully retrieved user for sync data updates")

	//get the token from the context
	tokenString := c.MustGet(pkg.ContextKeyTypeAuthToken).(string)
	tokenID, err := auth.GetTokenIDFromToken(tokenString)
	if err != nil {
		log.Errorf("Failed to get token ID from token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get token ID"})
		return
	}

	// Update token usage
	err = databaseRepo.UpdateTokenUsage(c, currentUser.ID, tokenID)
	if err != nil {
		log.Errorf("Failed to update token usage: %v", err)
		// Don't fail the request, just log the error
	}

	// Create device sync history
	history := &models.DeviceSyncHistory{
		UserID:    currentUser.ID,
		TokenID:   tokenID,
		DeviceID:  c.GetHeader("User-Agent"),
		Success:   true,
	}
	err = databaseRepo.CreateDeviceSyncHistory(c, history)
	if err != nil {
		log.Errorf("Failed to create device sync history: %v", err)
		// Don't fail the request, just log the error
	}

	since := c.Query("since")
	if since == "" {
		log.Error("Missing 'since' query parameter")
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Missing 'since' query parameter"})
		return
	}

	log.Debugf("Querying all resources for user since %s", since)
	allResources := make([]interface{}, 0)
	for _, resourceType := range databaseModel.GetAllowedResourceTypes() {
		resources, err := databaseRepo.QueryResources(c, models.QueryResource{
			From: resourceType,
			// Where: []models.QueryWhere{
			// 	{
			// 		Field:    "updated_at",
			// 		Operator: ">",
			// 		Value:    since,
			// 	},
			// },
		})
		if err != nil {
			log.Errorf("Failed to get resources of type %s: %v", resourceType, err)
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get resources"})
			return
		}

		if resources != nil {
			for _, r := range resources.([]models.ResourceBase) {
				allResources = append(allResources, r)
			}
		}
	}
	log.Debugf("Successfully retrieved %d resources", len(allResources))

	// lastUpdated, err := databaseRepo.GetLastUpdatedTimestamp(c)
	// if err != nil {
	// 	log.Errorf("Failed to get last updated timestamp: %v", err)
	// 	c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get last updated timestamp"})
	// 	return
	// }

	// sources, err := databaseRepo.GetSources(c)
	// if err != nil {
	// 	log.Errorf("Failed to get sources: %v", err)
	// 	c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get sources"})
	// 	return
	// }

	bundle := models.FhirBundle{
		ResourceType: "Bundle",
		Type:         "collection",
		Total:        len(allResources),
		Entry:        make([]models.BundleEntry, len(allResources)),
	}

	for i, resource := range allResources {
		bundle.Entry[i] = models.BundleEntry{
			Resource: resource,
		}
	}

	// ---- ADD THIS CODE FOR DEBUGGING ----
	bundleBytes, _ := json.MarshalIndent(bundle, "", "  ")
	fmt.Println("--- BEGIN DEBUG BUNDLE ---")
	fmt.Println(string(bundleBytes))
	fmt.Println("--- END DEBUG BUNDLE ---")
	// ------------------------------------

	c.JSON(http.StatusOK, bundle)

	// publish the event
	// err = eventBus.PublishMessage(models.NewEvent(models.EventTypeSourceSyncComplete, gin.H{
	// 	"success": true,
	// 	"token_id": tokenID,
	// }))
	// if err != nil {
	// 	log.Errorf("Failed to publish sync complete event: %v", err)
	// }
}

// GetSyncTokens returns sync tokens for current user (minimal implementation)
func GetSyncTokens(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		log.Errorf("Failed to get current user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get current user"})
		return
	}

	tokens, err := databaseRepo.GetUserSyncTokens(c, currentUser.ID)
	if err != nil {
		log.Errorf("Failed to get sync tokens: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get tokens"})
		return
	}

	// Convert to response format
	var responseTokens []map[string]interface{}
	for _, token := range tokens {
		responseTokens = append(responseTokens, map[string]interface{}{
			"tokenId":     token.TokenID,
			"name":        token.Name,
			"issuedAt":    token.IssuedAt,
			"expiresAt":   token.ExpiresAt,
			"useCount":    token.UseCount,
			"isRevoked":   token.IsRevoked,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    responseTokens,
	})
}

// GetSyncHistory returns sync history for current user (minimal implementation)
func GetSyncHistory(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		log.Errorf("Failed to get current user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get current user"})
		return
	}

	history, err := databaseRepo.GetUserSyncHistory(c, currentUser.ID, 50) // Limit to 50 entries
	if err != nil {
		log.Errorf("Failed to get sync history: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get history"})
		return
	}

	// Convert to response format
	var events []map[string]interface{}
	for _, event := range history {
		events = append(events, map[string]interface{}{
			"tokenId":   event.TokenID,
			"eventType": event.EventType,
			"eventTime": event.EventTime,
			"success":   event.Success,
			"errorMsg":  event.ErrorMsg,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"events": events,
		},
	})
}

// RevokeSync revokes sync tokens (minimal implementation)
func RevokeSync(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		log.Errorf("Failed to get current user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get current user"})
		return
	}

	var revokeRequest struct {
		TokenID *string `json:"tokenId,omitempty"`
		All     bool    `json:"all,omitempty"`
	}
	
	if err := c.ShouldBindJSON(&revokeRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid request format"})
		return
	}

	revokedBy := fmt.Sprintf("user:%s", currentUser.Username)

	if revokeRequest.All {
		// Revoke all tokens for user
		tokens, err := databaseRepo.GetUserSyncTokens(c, currentUser.ID)
		if err != nil {
			log.Errorf("Failed to get user tokens: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get tokens"})
			return
		}

		revokedCount := 0
		for _, token := range tokens {
			if !token.IsRevoked {
				if err := databaseRepo.RevokeSyncToken(c, token.TokenID, revokedBy); err == nil {
					revokedCount++
				}
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": fmt.Sprintf("Revoked %d sync tokens", revokedCount),
		})
		return
	}

	if revokeRequest.TokenID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Token ID is required"})
		return
	}

	err = databaseRepo.RevokeSyncToken(c, *revokeRequest.TokenID, revokedBy)
	if err != nil {
		log.Errorf("Failed to revoke sync token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to revoke token"})
		return
	}
	
	log.Debugf("Sync token revoked: tokenId=%s by %s", *revokeRequest.TokenID, revokedBy)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Sync token revoked successfully",
	})
}

// RevokeAllSyncTokens revokes all sync tokens for the current user
func RevokeAllSyncTokens(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		log.Errorf("Failed to get current user: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Unauthorized"})
		return
	}

	revokedBy := "user:" + currentUser.Username
	err = databaseRepo.RevokeAllSyncTokens(c, currentUser.ID, revokedBy)
	if err != nil {
		log.Errorf("Failed to revoke all sync tokens: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to revoke all sync tokens"})
		return
	}

	log.Infof("All sync tokens revoked for user %s", currentUser.Username)
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "All sync tokens revoked successfully"})
}

// DeleteSyncToken deletes a single sync token by tokenId
func DeleteSyncToken(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		log.Errorf("Failed to get current user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get current user"})
		return
	}

	var req struct {
		TokenID string `json:"tokenId"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.TokenID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Token ID is required"})
		return
	}

	// Optionally, check that the token belongs to the user
	tokens, err := databaseRepo.GetUserSyncTokens(c, currentUser.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get tokens"})
		return
	}
	found := false
	for _, t := range tokens {
		if t.TokenID == req.TokenID {
			found = true
			break
		}
	}
	if !found {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "Token does not belong to user"})
		return
	}

	err = databaseRepo.DeleteSyncToken(c, req.TokenID)
	if err != nil {
		log.Errorf("Failed to delete sync token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to delete token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Sync token deleted successfully"})
}

// DeleteAllSyncTokens deletes all sync tokens for the current user
func DeleteAllSyncTokens(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		log.Errorf("Failed to get current user: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Unauthorized"})
		return
	}

	count, err := databaseRepo.DeleteAllSyncTokens(c, currentUser.ID)
	if err != nil {
		log.Errorf("Failed to delete all sync tokens: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to delete all sync tokens"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "All sync tokens deleted successfully", "count": count})
}

func GetSyncStatus(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	appConfig := c.MustGet(pkg.ContextKeyTypeConfig).(config.Interface)

	log.Debug("Getting sync status")
	
	// Get server address and port
	serverAddress, serverPort := getServerAddress(c, appConfig)
	serverAddresses := getServerAddresses(c, appConfig)
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"status":       "active",
			"server_name":  fmt.Sprintf("Fasten Health Server (%s:%s)", serverAddress, serverPort),
			"server_host":  serverAddress,
			"server_port":  serverPort,
			"server_addresses": serverAddresses, // Multiple addresses for network resilience
			"api_version":  "v1",
			"sync_enabled": true,
			"endpoints": gin.H{
				"initiate":  "/api/secure/sync/initiate",
				"data":      "/api/secure/sync/data", 
				"updates":   "/api/secure/sync/updates",
				"tokens":    "/api/secure/sync/tokens",
				"history":   "/api/secure/sync/history",
				"revoke":    "/api/secure/sync/revoke",
				"discovery": "/api/secure/sync/discovery",
			},
		},
	})
}

// GetServerDiscovery returns all available server addresses for network resilience
func GetServerDiscovery(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	appConfig := c.MustGet(pkg.ContextKeyTypeConfig).(config.Interface)

	log.Debug("Getting server discovery information")
	
	serverAddresses := getServerAddresses(c, appConfig)
	primaryAddress, serverPort := getServerAddress(c, appConfig)
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"primary_address": primaryAddress,
			"port":           serverPort,
			"addresses":      serverAddresses,
			"server_info": gin.H{
				"name":    "Fasten Health Server",
				"version": "1.0.0",
				"docker":  true,
			},
			"network_info": gin.H{
				"supports_network_changes": true,
				"auto_reconnection":       true,
				"fallback_addresses":      len(serverAddresses) > 1,
			},
		},
	})
}

// GetDeviceSyncHistory returns device sync history for current user
func GetDeviceSyncHistory(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		log.Errorf("Failed to get current user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get current user"})
		return
	}

	history, err := databaseRepo.GetUserDeviceSyncHistory(c, currentUser.ID, 50)
	if err != nil {
		log.Errorf("Failed to get device sync history: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get device sync history"})
		return
	}

	var events []map[string]interface{}
	for _, event := range history {
		events = append(events, map[string]interface{}{
			"deviceId": event.DeviceID,
			"tokenId": event.TokenID,
			"eventTime": event.EventTime,
			"success": event.Success,
			"userAgent": event.UserAgent,
			"dataVolume": event.DataVolume,
			"errorMsg": event.ErrorMsg,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"events": events,
		},
	})
}
