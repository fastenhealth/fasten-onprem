package middleware

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/web/sse"
	"github.com/gin-gonic/gin"
)

func SSEHeaderMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Content-Type", "text/event-stream")
		c.Writer.Header().Set("Cache-Control", "no-cache")
		c.Writer.Header().Set("Connection", "keep-alive")
		c.Writer.Header().Set("Transfer-Encoding", "chunked")
		c.Next()
	}
}

func SSEEventBusServerMiddleware() gin.HandlerFunc {

	// get reference to streaming server singleton
	bus := sse.GetEventBusServer()

	return func(c *gin.Context) {
		// Initialize client channel
		clientChan := make(sse.ClientChan)

		// Send new connection to event server
		bus.NewClients <- clientChan

		defer func() {
			// Send closed connection to event server
			bus.ClosedClients <- clientChan
		}()

		c.Set(pkg.ContextKeyTypeSSEEventBusServer, bus)
		c.Set(pkg.ContextKeyTypeSSEClientChannel, clientChan)

		c.Next()
	}
}
