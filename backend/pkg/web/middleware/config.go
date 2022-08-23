package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/packagrio/goweb-template/backend/pkg/config"
)

func ConfigMiddleware(appConfig config.Interface) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("CONFIG", appConfig)
		c.Next()
	}
}
