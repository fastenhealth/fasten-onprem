package middleware

import (
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/database"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func RepositoryMiddleware(appConfig config.Interface, globalLogger logrus.FieldLogger) gin.HandlerFunc {

	deviceRepo, err := database.NewRepository(appConfig, globalLogger)
	if err != nil {
		panic(err)
	}

	//TODO: determine where we can call defer deviceRepo.Close()
	return func(c *gin.Context) {
		c.Set(pkg.ContextKeyTypeDatabase, deviceRepo)
		c.Next()
	}
}
