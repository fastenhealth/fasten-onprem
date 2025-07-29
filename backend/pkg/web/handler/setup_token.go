package handler

import (
	"net/http"
	"os"
	"time"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/gin-gonic/gin"
)

func SetupToken(appConfig config.Interface) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.PostForm("token")

		if token == "" {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "token is required"})
			return
		}

		appConfig.Set("database.encryption_key", token)

		c.JSON(http.StatusOK, gin.H{"success": true})

		// Shutdown the server gracefully
		go func() {
			time.Sleep(1 * time.Second)
			os.Exit(0)
		}()
	}
}
