package middleware

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/gin-gonic/gin"
)

func ConfigMiddleware(appConfig config.Interface) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set(pkg.ContextKeyTypeConfig, appConfig)
		c.Next()
	}
}
