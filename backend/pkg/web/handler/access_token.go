package handler

import (
	"crypto/rand"
	// "os"
	"encoding/hex"
	"fmt"
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

	// Generate access token with 24-hour expiration
	now := time.Now()
	expiresAt := now.Add(24 * time.Hour)
	
	accessToken, err := auth.JwtGenerateAccessToken(*currentUser, appConfig.GetString("jwt.issuer.key"), expiresAt, tokenID)
	if err != nil {
		log.Errorf("Failed to generate access token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	// Store token metadata in database  
	tokenHash := database.HashToken(accessToken)
	
	dbAccessToken := &models.AccessToken{
		UserID:      currentUser.ID,
		TokenID:     tokenID,
		TokenHash:   tokenHash,
		Name:        fmt.Sprintf("Access Token - %s", time.Now().Format("Jan 2, 2006")),
		IssuedAt:    now,
		ExpiresAt:   expiresAt,
		IsActive:    true,

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
			"token": accessToken,
			// "token_details": gin.H{
			// 	"token_id":     dbAccessToken.TokenID,
			// 	"name":         dbAccessToken.Name,
			// 	"description":  dbAccessToken.Description,
			// 	"issued_at":    dbAccessToken.IssuedAt.Format(time.RFC3339),
			// 	"expires_at":   dbAccessToken.ExpiresAt.Format(time.RFC3339),
			// 	"last_used_at": dbAccessToken.LastUsedAt,
			// 	"is_active":    dbAccessToken.IsActive,
			// 	"is_revoked":   dbAccessToken.IsRevoked,
			// 	"use_count":    dbAccessToken.UseCount,
			// 	"status":       dbAccessToken.GetStatus(),
			// },
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
	
			"use_count":    token.UseCount,
			"status":       token.GetStatus(),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"tokens": responseTokens,
		},
	})
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
				"delete":     "/api/secure/access/delete",
				"delete_all": "/api/secure/access/delete-all",
			},
			"features": []string{
				"Mobile app access",
				"QR code authentication",
				"Device management",
			},
		},
	})
}
