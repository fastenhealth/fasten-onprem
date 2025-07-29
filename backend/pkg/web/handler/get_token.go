package handler

import (
	"net/http"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/gin-gonic/gin"
)

func GetToken(appConfig config.Interface) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := appConfig.GetString("database.encryption_key")
		if token == "" {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "token is miss"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"success": true, "data": token})

	}
}
