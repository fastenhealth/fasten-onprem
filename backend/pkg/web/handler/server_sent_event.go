package handler

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/gin-gonic/gin"
	"io"
	"log"
)

// SSEStream is a handler for the server sent event stream (notifications from background processes)
// see: https://github.com/gin-gonic/examples/blob/master/server-sent-event/main.go
// see: https://stackoverflow.com/questions/66327142/selectively-send-event-to-particular-clients
//
// test using:
// curl -N -H "Authorization: Bearer xxxxx" http://localhost:9090/api/secure/sse/stream
func SSEStream(c *gin.Context) {

	//logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	//databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)
	v, ok := c.Get(pkg.ContextKeyTypeSSEClientChannel)
	if !ok {
		log.Printf("could not get client channel from context")
		return
	}
	listener, ok := v.(*event_bus.EventBusListener)
	if !ok {
		return
	}
	c.Stream(func(w io.Writer) bool {
		// Stream message to client from message channel
		if msg, ok := <-listener.ResponseChan; ok {
			c.SSEvent("message", msg)
			return true
		}
		return false
	})
}
