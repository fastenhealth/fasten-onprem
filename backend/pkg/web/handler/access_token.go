package handler

import (
	"fmt"
	"net/http"
	"time"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/auth"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

// InitiateAccess generates a new access token for mobile app authentication
type CreateTokenPayload struct {
	Name       string `json:"name"`
	Expiration int    `json:"expiration"` // Expiration in days. 0 for no expiration.
}

type DeleteTokenPayload struct {
	TokenID string `json:"token_id"`
}

// CreateAccessToken generates a new access token for mobile app authentication
func CreateAccessToken(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)
	appConfig := c.MustGet(pkg.ContextKeyTypeConfig).(config.Interface)

	tokenModel, err := buildAccessTokenModel(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid request format"})
		return
	}

	currentUser, err := databaseRepo.GetCurrentUser(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to get current user"})
		return
	}

	accessToken, err := auth.JwtGenerateAccessToken(*currentUser, appConfig.GetString("jwt.issuer.key"), tokenModel.ExpiresAt, tokenModel.TokenID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	err = databaseRepo.CreateAccessToken(c, tokenModel)
	if err != nil {
		log.Errorf("failed to store access token: %v", err)
		// Still return the token even if storage fails
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    accessToken,
	})
}

// GetAccessTokens returns access tokens for current user
func GetAccessTokens(c *gin.Context) {
	log := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	tokens, err := databaseRepo.GetUserAccessTokens(c)
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

	var req DeleteTokenPayload

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid request format"})
		return
	}

	err := databaseRepo.DeleteAccessToken(c, req.TokenID)
	if err != nil {
		log.Errorf("Failed to delete access token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "Failed to delete access token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Access token deleted successfully"})
}

func buildAccessTokenModel(c *gin.Context) (*models.AccessToken, error) {
	var payload CreateTokenPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		return nil, err
	}

	now := time.Now()
	var expiresAt time.Time
	if payload.Expiration > 0 {
		expiresAt = now.Add(time.Duration(payload.Expiration) * 24 * time.Hour)
	} else {
		// If expiration is 0, set a very far future date for "no expiration"
		expiresAt = time.Date(2099, time.December, 31, 23, 59, 59, 0, time.UTC)
	}

	tokenName := payload.Name
	if tokenName == "" {
		tokenName = fmt.Sprintf("Access Token - %s", time.Now().Format("Jan 2, 2006"))
	}

	return &models.AccessToken{
		TokenID:   uuid.New().String(),
		Name:      tokenName,
		IssuedAt:  now,
		ExpiresAt: expiresAt,
	}, nil
}
