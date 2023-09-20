package handler

import (
	"fmt"
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/gin-gonic/gin"
	"io"
)

// SSEStream is a handler for the server sent event stream (notifications from background processes)
// see: https://github.com/gin-gonic/examples/blob/master/server-sent-event/main.go
// see: https://stackoverflow.com/questions/66327142/selectively-send-event-to-particular-clients
//
// test using:
// curl -N -H "Authorization: Bearer xxxxx" http://localhost:9090/api/secure/sse/stream

func SSEEventBusServerHandler(eventBus event_bus.Interface) gin.HandlerFunc {

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
		eventBus.AddListener(&clientListener)

		defer func() {
			// Send closed connection to event server
			eventBus.RemoveListener(&clientListener)
		}()

		c.Stream(func(w io.Writer) bool {
			// Stream message to client from message channel
			if msg, ok := <-clientListener.ResponseChan; ok {
				c.SSEvent("message", msg)
				return true
			}
			return false
		})

	}
}
