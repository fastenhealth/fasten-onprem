package handler

import (
	"crypto/rand"
	"crypto/sha256"
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
type InitiateAccessRequest struct {
	Name       string `json:"name"`
	Expiration int    `json:"expiration"` // Expiration in days. 0 for no expiration.
}

// InitiateAccess generates a new access token for mobile app authentication
func InitiateAccess(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)
	appConfig := c.MustGet(pkg.ContextKeyTypeConfig).(config.Interface)

	var req InitiateAccessRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		// If there's an error binding, or no name is provided, proceed without a specific name
		log.Debugf("No device name provided or invalid request format: %v", err)
	}

	log.Debug("Attempting to get current user for access initiation")
	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		log.Errorf("Failed to get current user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get current user"})
		return
	}
	log.Debugf("Successfully retrieved user: %s", currentUser.Username)

	tokenIDBytes := make([]byte, 16)
	rand.Read(tokenIDBytes)
	tokenID := hex.EncodeToString(tokenIDBytes)

	// Generate access token with expiration based on request
	now := time.Now()
	var expiresAt time.Time
	if req.Expiration > 0 {
		expiresAt = now.Add(time.Duration(req.Expiration) * 24 * time.Hour)
	} else {
		// If expiration is 0, set a very far future date for "no expiration"
		expiresAt = time.Date(2099, time.December, 31, 23, 59, 59, 0, time.UTC)
	}

	accessToken, err := auth.JwtGenerateAccessToken(*currentUser, appConfig.GetString("jwt.issuer.key"), expiresAt, tokenID)
	if err != nil {
		log.Errorf("Failed to generate access token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	tokenName := req.Name
	if tokenName == "" {
		tokenName = fmt.Sprintf("Access Token - %s", time.Now().Format("Jan 2, 2006"))
	}

	tokenHash := hashToken(accessToken)

	dbAccessToken := &models.AccessToken{
		UserID:    currentUser.ID,
		TokenID:   tokenID,
		TokenHash: tokenHash,
		Name:      tokenName,
		IssuedAt:  now,
		ExpiresAt: expiresAt,
		IsActive:  true,
		Scopes:    "access:read,access:write",
	}

	err = databaseRepo.CreateAccessToken(c, dbAccessToken)
	if err != nil {
		log.Errorf("Failed to store access token: %v", err)
		// Still return the token even if storage fails
	}

	log.Debug("Successfully generated access token")

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    accessToken,
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

	c.JSON(http.StatusOK, gin.H{"success": true, "data": tokens})
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

func hashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}