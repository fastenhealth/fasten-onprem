package handler

import (
	"net/http"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/utils" // Import the utils package
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// EncryptionKeyPayload defines the structure for the encryption key JSON payload
type EncryptionKeyPayload struct {
	EncryptionKey string `json:"encryption_key"`
}

// EncryptionKeyHandler holds dependencies for encryption key-related operations
type AppEngineInterface interface {
	Reinitialize() error
}

// EncryptionKeyHandler holds dependencies for encryption key-related operations
type EncryptionKeyHandler struct {
	AppConfig   config.Interface
	Logger      *logrus.Entry
	AppEngine   AppEngineInterface
}

// NewEncryptionKeyHandler creates a new EncryptionKeyHandler
func NewEncryptionKeyHandler(appConfig config.Interface, logger *logrus.Entry, appEngine AppEngineInterface) *EncryptionKeyHandler {
	return &EncryptionKeyHandler{
		AppConfig:   appConfig,
		Logger:      logger,
		AppEngine:   appEngine,
	}
}

// GetEncryptionKey handles the GET /api/encryption-key endpoint
func (h *EncryptionKeyHandler) GetEncryptionKey(c *gin.Context) {
	encryptionKey, err := utils.GenerateRandomKey(32)
	if err != nil {
		h.Logger.Errorf("failed to generate random key: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": encryptionKey})
}

// SetupEncryptionKey handles the POST /api/encryption-key endpoint
func (h *EncryptionKeyHandler) SetEncryptionKey(c *gin.Context) {
	var payload EncryptionKeyPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	if payload.EncryptionKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "encryption key is required"})
		return
	}

	h.AppConfig.Set("database.encryption.key", payload.EncryptionKey)

	c.JSON(http.StatusOK, gin.H{"success": true})

	// Reinitialize the server after setting the encryption key
	go func() {
		if err := h.AppEngine.Reinitialize(); err != nil {
			h.Logger.Errorf("Failed to reinitialize AppEngine: %v", err)
		}
	}()
}

// ValidateEncryptionKey handles the POST /api/encryption-key/validate endpoint
func (h *EncryptionKeyHandler) ValidateEncryptionKey(c *gin.Context) {
	var payload EncryptionKeyPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	h.Logger.Info(payload.EncryptionKey)
	
	if payload.EncryptionKey == "" {
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
	tempConfig.Set("database.encryption.key", payload.EncryptionKey)
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
