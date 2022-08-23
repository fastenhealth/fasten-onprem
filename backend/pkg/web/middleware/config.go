package middleware

import (
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/gin-gonic/gin"
)

func ConfigMiddleware(appConfig config.Interface) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("CONFIG", appConfig)
		c.Next()
	}
}
