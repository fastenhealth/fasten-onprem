package middleware

import (
	"fmt"
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
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

func SSEEventBusServerMiddleware(logger *logrus.Entry) gin.HandlerFunc {

	// get reference to streaming server singleton
	bus := event_bus.GetEventBusServer(logger)

	return func(c *gin.Context) {
		//get a reference to the current user
		databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

		foundUser, err := databaseRepo.GetCurrentUser(c)
		if err != nil || foundUser == nil {
			c.Error(fmt.Errorf("could not find user"))
			return
		}

		// Initialize client channel
		clientListener := event_bus.EventBusListener{
			ResponseChan: make(chan string),
			UserID:       foundUser.ID.String(),
		}

		// Send new connection to event server
		bus.NewListener <- clientListener

		defer func() {
			// Send closed connection to event server
			bus.ClosedListener <- clientListener
		}()

		c.Set(pkg.ContextKeyTypeSSEEventBusServer, bus)
		c.Set(pkg.ContextKeyTypeSSEClientChannel, clientListener)

		c.Next()
	}
}
