package handler

import (
	"net/http"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func ValidateToken(appConfig config.Interface, logger *logrus.Entry) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.PostForm("token")
		if token == "" {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "token is required"})
			return
		}

		// Create a temporary config for validation
		tempConfig, err := config.Create()
		if err != nil {
			logger.Errorf("failed to create temp config: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "internal server error"})
			return
		}
		tempConfig.Set("database.encryption_key", token)
		tempConfig.Set("database.location", appConfig.GetString("database.location"))
		tempConfig.Set("database.encryption.enabled", true)

		// Attempt to initialize the database with the provided token
		_, err = database.NewRepository(tempConfig, logger, event_bus.NewNoopEventBusServer())
		if err != nil {
			logger.Errorf("failed to validate token: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"success": false})
			return
		}

		c.JSON(http.StatusOK, gin.H{"success": true})
	}
}
