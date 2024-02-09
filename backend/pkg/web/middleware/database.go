package middleware

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/gin-gonic/gin"
)

func RepositoryMiddleware(deviceRepo database.DatabaseRepository) gin.HandlerFunc {
	//TODO: determine where we can call defer deviceRepo.Close()
	return func(c *gin.Context) {
		c.Set(pkg.ContextKeyTypeDatabase, deviceRepo)
		c.Next()
	}
}
