package handler

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net"
	"net/http"
	"time"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/auth"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// getServerAddress gets the server address and port, prioritizing non-local addresses
func getServerAddress(c *gin.Context, appConfig config.Interface) (string, string) {
	// Get the port from the app config
	port := appConfig.GetString("web.listen.port")

	// Priority 1: UPnP discovered IP
	if upnpHost := appConfig.GetString("upnp.local_ip"); upnpHost != "" {
		return upnpHost, port
	}

	// Priority 2: Environment variable override (deprecated, but kept for compatibility)
	// if envHost := os.Getenv("FASTEN_EXTERNAL_HOST"); envHost != "" {
	// 	return envHost, externalPort
	// }

	// Priority 3: Headers from reverse proxies
	if forwardedHost := c.GetHeader("X-Forwarded-Host"); forwardedHost != "" {
		if host, _, err := net.SplitHostPort(forwardedHost); err == nil {
			return host, port
		}
		return forwardedHost, port
	}
	if realIP := c.GetHeader("X-Real-IP"); realIP != "" {
		return realIP, port
	}

	// Priority 3: Detect a private, non-loopback IP address
	// In a Docker container, this will be the container's IP, which is not what we want.
	// However, we will return all possible IPs in getServerAddresses, so the client can try them all.
	// For the primary address, we'll prefer a private IP, but fallback gracefully.
	if addrs, err := net.InterfaceAddrs(); err == nil {
		for _, addr := range addrs {
			if ipnet, ok := addr.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
				if ip := ipnet.IP.To4(); ip != nil && ip.IsPrivate() {
					return ip.String(), port
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
	// if envHost := os.Getenv("FASTEN_EXTERNAL_HOST"); envHost != "" {
	// 	addAddress(fmt.Sprintf("%s:%s", envHost, port))
	// }

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

// InitiateAccess generates a new access token for mobile app authentication
func InitiateAccess(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)
	appConfig := c.MustGet(pkg.ContextKeyTypeConfig).(config.Interface)

	log.Debug("Attempting to get current user for access initiation")
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
	
	// Generate access token with 24-hour expiration
	now := time.Now()
	expiresAt := now.Add(24 * time.Hour)
	
	accessToken, err := auth.JwtGenerateAccessToken(*currentUser, appConfig.GetString("jwt.issuer.key"), expiresAt, tokenID, userAgent)
	if err != nil {
		log.Errorf("Failed to generate access token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	// Store token metadata in database  
	tokenHash := database.HashToken(accessToken)
	serverAddress, serverPort := getServerAddress(c, appConfig)
	
	dbAccessToken := &models.AccessToken{
		UserID:      currentUser.ID,
		TokenID:     tokenID,
		TokenHash:   tokenHash,
		Name:        fmt.Sprintf("Mobile Access - %s", time.Now().Format("Jan 2, 2006")),
		Description: "Access token for Health Wallet mobile app",
		UserAgent:   userAgent,
		IssuedAt:    now,
		ExpiresAt:   expiresAt,
		IsActive:    true,
		IsRevoked:   false,
		ServerName:  fmt.Sprintf("Fasten Health Server (%s:%s)", serverAddress, serverPort),
		ServerHost:  serverAddress,
		ServerPort:  serverPort,
		Scopes:      "access:read,access:write",
	}

	err = databaseRepo.CreateAccessToken(c, dbAccessToken)
	if err != nil {
		log.Errorf("Failed to store access token: %v", err)
		// Still return the token even if storage fails
	}

	log.Debug("Successfully generated access token")

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"token":   accessToken,
			"expiresAt": expiresAt.Format(time.RFC3339),
			"token_info": gin.H{
				"type": "access",
				"scopes": "access:read,access:write",
				"expires_in": "24h",
			},
		},
	})
}

// GetAccessTokens returns access tokens for current user
func GetAccessTokens(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		log.Errorf("Failed to get current user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get current user"})
		return
	}

	tokens, err := databaseRepo.GetUserAccessTokens(c, currentUser.ID)
	if err != nil {
		log.Errorf("Failed to get access tokens: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get access tokens"})
		return
	}

	// Convert to response format
	var responseTokens []gin.H
	for _, token := range tokens {
		responseTokens = append(responseTokens, gin.H{
			"token_id":     token.TokenID,
			"name":         token.Name,
			"description":  token.Description,
			"issued_at":    token.IssuedAt.Format(time.RFC3339),
			"expires_at":   token.ExpiresAt.Format(time.RFC3339),
			"last_used_at": token.LastUsedAt,
			"is_active":    token.IsActive,
			"is_revoked":   token.IsRevoked,
			"use_count":    token.UseCount,
			"status":       token.GetStatus(),
			"server_info": gin.H{
				"name": token.ServerName,
				"host": token.ServerHost,
				"port": token.ServerPort,
			},
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"tokens": responseTokens,
		},
	})
}

// GetAccessHistory returns access token history for current user
func GetAccessHistory(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		log.Errorf("Failed to get current user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get current user"})
		return
	}

	limit := 100 // Default limit
	history, err := databaseRepo.GetUserAccessHistory(c, currentUser.ID, limit)
	if err != nil {
		log.Errorf("Failed to get access history: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get access history"})
		return
	}

	var responseHistory []gin.H
	for _, entry := range history {
		responseHistory = append(responseHistory, gin.H{
			"token_id":   entry.TokenID,
			"event_type": entry.EventType,
			"event_time": entry.EventTime.Format(time.RFC3339),
			"user_agent": entry.UserAgent,
			"success":    entry.Success,
			"error_msg":  entry.ErrorMsg,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"history": responseHistory,
		},
	})
}

// GetDeviceAccessHistory returns device access history for current user
func GetDeviceAccessHistory(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		log.Errorf("Failed to get current user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get current user"})
		return
	}

	limit := 100 // Default limit
	history, err := databaseRepo.GetUserDeviceAccessHistory(c, currentUser.ID, limit)
	if err != nil {
		log.Errorf("Failed to get device access history: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get device access history"})
		return
	}

	var responseHistory []gin.H
	for _, entry := range history {
		responseHistory = append(responseHistory, gin.H{
			"device_id":      entry.DeviceID,
			"client_name":    entry.ClientName,
			"client_version": entry.ClientVersion,
			"platform":       entry.Platform,
			"connected_at":   entry.ConnectedAt.Format(time.RFC3339),
			"last_seen":      entry.LastSeen.Format(time.RFC3339),
			"sync_count":     entry.SyncCount,
			"data_synced":    entry.DataSynced,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"history": responseHistory,
		},
	})
}

// RevokeAccess revokes access tokens
func RevokeAccess(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		log.Errorf("Failed to get current user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get current user"})
		return
	}

	var revokeRequest struct {
		TokenID *string `json:"token_id"`
		All     bool    `json:"all"`
	}

	if err := c.ShouldBindJSON(&revokeRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid request format"})
		return
	}

	revokedBy := currentUser.Username

	if revokeRequest.All {
		// Revoke all tokens for the user
		tokens, err := databaseRepo.GetUserAccessTokens(c, currentUser.ID)
		if err != nil {
			log.Errorf("Failed to get access tokens: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get access tokens"})
			return
		}

		revokedCount := 0
		for _, token := range tokens {
			if err := databaseRepo.RevokeAccessToken(c, token.TokenID, revokedBy); err == nil {
				revokedCount++
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": fmt.Sprintf("Revoked %d access tokens", revokedCount),
		})
		return
	}

	// Revoke specific token
	if revokeRequest.TokenID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Token ID is required"})
		return
	}

	err = databaseRepo.RevokeAccessToken(c, *revokeRequest.TokenID, revokedBy)
	if err != nil {
		log.Errorf("Failed to revoke access token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to revoke access token"})
		return
	}

	log.Debugf("Access token revoked: tokenId=%s by %s", *revokeRequest.TokenID, revokedBy)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Access token revoked successfully",
	})
}

// RevokeAllAccessTokens revokes all access tokens for the current user
func RevokeAllAccessTokens(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		log.Errorf("Failed to get current user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get current user"})
		return
	}

	revokedBy := currentUser.Username
	err = databaseRepo.RevokeAllAccessTokens(c, currentUser.ID, revokedBy)
	if err != nil {
		log.Errorf("Failed to revoke all access tokens: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to revoke all access tokens"})
		return
	}

	log.Infof("All access tokens revoked for user %s", currentUser.Username)
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "All access tokens revoked successfully"})
}

// DeleteAccessToken deletes a single access token by tokenId
func DeleteAccessToken(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		log.Errorf("Failed to get current user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get current user"})
		return
	}

	var req struct {
		TokenID string `json:"token_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid request format"})
		return
	}

	// Verify the token belongs to the current user
	tokens, err := databaseRepo.GetUserAccessTokens(c, currentUser.ID)
	if err != nil {
		log.Errorf("Failed to get access tokens: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get access tokens"})
		return
	}

	tokenExists := false
	for _, token := range tokens {
		if token.TokenID == req.TokenID {
			tokenExists = true
			break
		}
	}

	if !tokenExists {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Access token not found"})
		return
	}

	err = databaseRepo.DeleteAccessToken(c, req.TokenID)
	if err != nil {
		log.Errorf("Failed to delete access token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to delete access token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Access token deleted successfully"})
}

// DeleteAllAccessTokens deletes all access tokens for the current user
func DeleteAllAccessTokens(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		log.Errorf("Failed to get current user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get current user"})
		return
	}

	count, err := databaseRepo.DeleteAllAccessTokens(c, currentUser.ID)
	if err != nil {
		log.Errorf("Failed to delete all access tokens: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to delete all access tokens"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "All access tokens deleted successfully", "count": count})
}

// GetAccessStatus returns the current access status and available endpoints
func GetAccessStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"status": "active",
			"endpoints": gin.H{
				"tokens":     "/api/secure/access/tokens",
				"history":    "/api/secure/access/history",
				"devices":    "/api/secure/access/device-history",
				"revoke":     "/api/secure/access/revoke",
				"revoke_all": "/api/secure/access/revoke-all",
				"delete":     "/api/secure/access/delete",
				"delete_all": "/api/secure/access/delete-all",
			},
			"features": []string{
				"Mobile app access",
				"QR code authentication",
				"Device management",
				"Access history tracking",
			},
		},
	})
}
