package middleware

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/gin-gonic/gin"
)

func EventBusMiddleware(eventBus event_bus.Interface) gin.HandlerFunc {

	return func(c *gin.Context) {
		c.Set(pkg.ContextKeyTypeEventBusServer, eventBus)
		c.Next()
	}
}
