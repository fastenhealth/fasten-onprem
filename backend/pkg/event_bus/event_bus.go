package event_bus

import (
	"encoding/json"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/sirupsen/logrus"
	"log"
)

// It keeps a list of clients those are currently attached
// and broadcasting events to those clients.
type eventBus struct {
	logger logrus.FieldLogger

	// Events are pushed to this channel by the main events-gathering routine
	message chan EventBusMessage

	// New client connections
	newListener chan *EventBusListener

	// Closed client connections
	closedListener chan *EventBusListener

	// Total client connections
	totalRoomListeners map[string][]*EventBusListener
}

type EventBusListener struct {
	ResponseChan chan string
	UserID       string
}

type EventBusMessage struct {
	UserID  string
	Message string
}

// It Listens all incoming requests from clients.
// Handles addition and removal of clients and broadcast messages to clients.
// TODO: determine how to route messages based on authenticated client
func (bus *eventBus) listen() {
	for {
		select {
		// Add new available client
		case listener := <-bus.newListener:
			//check if this userId room already exists, or create it
			if _, exists := bus.totalRoomListeners[listener.UserID]; !exists {
				bus.totalRoomListeners[listener.UserID] = []*EventBusListener{}
			}
			bus.totalRoomListeners[listener.UserID] = append(bus.totalRoomListeners[listener.UserID], listener)
			log.Printf("Listener added to room: `%s`. %d registered listeners", listener.UserID, len(bus.totalRoomListeners[listener.UserID]))

		// Remove closed client
		case listener := <-bus.closedListener:
			if _, exists := bus.totalRoomListeners[listener.UserID]; !exists {
				log.Printf("Room `%s` not found", listener.UserID)
				continue
			} else {
				//loop through all the listeners in the room and remove the one that matches
				for i, v := range bus.totalRoomListeners[listener.UserID] {
					if v.ResponseChan == listener.ResponseChan {
						bus.totalRoomListeners[listener.UserID] = append(bus.totalRoomListeners[listener.UserID][:i], bus.totalRoomListeners[listener.UserID][i+1:]...)
						close(listener.ResponseChan)
						log.Printf("Removed listener from room: `%s`. %d registered clients", listener.UserID, len(bus.totalRoomListeners[listener.UserID]))
						break
					}
				}
			}

		// Broadcast message to client
		case eventMsg := <-bus.message:
			if _, exists := bus.totalRoomListeners[eventMsg.UserID]; !exists {
				log.Printf("Room `%s` not found, could not send message: `%s`", eventMsg.UserID, eventMsg.Message)
				continue
			} else {
				for _, roomListener := range bus.totalRoomListeners[eventMsg.UserID] {
					roomListener.ResponseChan <- eventMsg.Message
				}
			}

		}
	}
}

func (bus *eventBus) PublishMessage(eventMsg models.EventInterface) error {
	bus.logger.Infof("Publishing message to room: `%s`", eventMsg.GetUserID())
	payload, err := json.Marshal(eventMsg)
	if err != nil {
		return err
	}
	bus.message <- EventBusMessage{
		UserID:  eventMsg.GetUserID(),
		Message: string(payload),
	}
	return nil
}

func (bus *eventBus) AddListener(listener *EventBusListener) {
	bus.newListener <- listener
}
func (bus *eventBus) RemoveListener(listener *EventBusListener) {
	bus.closedListener <- listener
}
func (bus *eventBus) TotalRooms() int {
	return len(bus.totalRoomListeners)
}

func (bus *eventBus) TotalListenersByRoom(room string) int {
	listeners, ok := bus.totalRoomListeners[room]
	if !ok {
		return 0
	} else {
		return len(listeners)
	}
}
