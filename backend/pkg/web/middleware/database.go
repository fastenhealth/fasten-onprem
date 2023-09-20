package middleware

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func RepositoryMiddleware(appConfig config.Interface, globalLogger logrus.FieldLogger, eventBus event_bus.Interface) gin.HandlerFunc {

	deviceRepo, err := database.NewRepository(appConfig, globalLogger, eventBus)
	if err != nil {
		panic(err)
	}

	//TODO: determine where we can call defer deviceRepo.Close()
	return func(c *gin.Context) {
		c.Set(pkg.ContextKeyTypeDatabase, deviceRepo)
		c.Next()
	}
}
