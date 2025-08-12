package handler

import (
	"net/http"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// EncryptionKeyHandler holds dependencies for encryption key-related operations
type EncryptionKeyHandler struct {
	AppConfig   config.Interface
	Logger      *logrus.Entry
	RestartChan chan bool
}

// NewEncryptionKeyHandler creates a new EncryptionKeyHandler
func NewEncryptionKeyHandler(appConfig config.Interface, logger *logrus.Entry, restartChan chan bool) *EncryptionKeyHandler {
	return &EncryptionKeyHandler{
		AppConfig:   appConfig,
		Logger:      logger,
		RestartChan: restartChan,
	}
}

// GetEncryptionKey handles the GET /api/encryption-key endpoint
func (h *EncryptionKeyHandler) GetEncryptionKey(c *gin.Context) {
	encryptionKey := h.AppConfig.GetString("database.encryption_key")
	if encryptionKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "encryption key is missing"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": encryptionKey})
}

// SetupEncryptionKey handles the POST /api/encryption-key endpoint
func (h *EncryptionKeyHandler) SetupEncryptionKey(c *gin.Context) {
	encryptionKey := c.PostForm("encryption_key")

	if encryptionKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "encryption key is required"})
		return
	}

	h.AppConfig.Set("database.encryption_key", encryptionKey)

	c.JSON(http.StatusOK, gin.H{"success": true})

	//signal to restart the server
	h.RestartChan <- true
}

// ValidateEncryptionKey handles the POST /api/encryption-key/validate endpoint
func (h *EncryptionKeyHandler) ValidateEncryptionKey(c *gin.Context) {
	encryptionKey := c.PostForm("encryption_key")
	if encryptionKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "encryption key is required"})
		return
	}

	// Create a temporary config for validation
	tempConfig, err := config.Create()
	if err != nil {
		h.Logger.Errorf("failed to create temp config: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "internal server error"})
		return
	}
	tempConfig.Set("database.encryption_key", encryptionKey)
	tempConfig.Set("database.location", h.AppConfig.GetString("database.location"))
	tempConfig.Set("database.encryption.enabled", true)
	tempConfig.Set("database.validation_mode", true)

	// Attempt to initialize the database with the provided encryption key
	_, err = database.NewRepository(tempConfig, h.Logger, event_bus.NewNoopEventBusServer())
	if err != nil {
		h.Logger.Errorf("failed to validate encryption key: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"success": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
