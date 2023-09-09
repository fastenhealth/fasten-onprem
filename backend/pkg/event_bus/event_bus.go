package event_bus

import (
	"encoding/json"
	"fmt"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/sirupsen/logrus"
	"log"
	"sync"
)

var eventBusLock = &sync.Mutex{}

var singletonEventBusInstance *EventBus

// New event messages are broadcast to all registered client connection channels
// TODO: change this to be use specific channels.
type ClientChan chan string

// Get a reference to the EventBus singleton Start procnteessing requests
// this should be a singleton, to ensure that we're always broadcasting to the same clients
// see: https://refactoring.guru/design-patterns/singleton/go/example
func GetEventBusServer(logger logrus.FieldLogger) *EventBus {
	if singletonEventBusInstance == nil {
		eventBusLock.Lock()
		defer eventBusLock.Unlock()
		if singletonEventBusInstance == nil {
			fmt.Println("Creating single instance now.")
			singletonEventBusInstance = &EventBus{
				Logger:             logger,
				Message:            make(chan EventBusMessage),
				NewListener:        make(chan EventBusListener),
				ClosedListener:     make(chan EventBusListener),
				TotalRoomListeners: make(map[string][]EventBusListener),
			}

			// Start processing requests
			go singletonEventBusInstance.listen()
		} else {
			fmt.Println("Single instance already created.")
		}
	} else {
		fmt.Println("Single instance already created.")
	}

	return singletonEventBusInstance
}

// It keeps a list of clients those are currently attached
// and broadcasting events to those clients.
type EventBus struct {
	Logger logrus.FieldLogger

	// Events are pushed to this channel by the main events-gathering routine
	Message chan EventBusMessage

	// New client connections
	NewListener chan EventBusListener

	// Closed client connections
	ClosedListener chan EventBusListener

	// Total client connections
	TotalRoomListeners map[string][]EventBusListener
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
func (bus *EventBus) listen() {
	for {
		select {
		// Add new available client
		case listener := <-bus.NewListener:
			//check if this userId room already exists, or create it
			if _, exists := bus.TotalRoomListeners[listener.UserID]; !exists {
				bus.TotalRoomListeners[listener.UserID] = []EventBusListener{}
			}
			bus.TotalRoomListeners[listener.UserID] = append(bus.TotalRoomListeners[listener.UserID], listener)
			log.Printf("Listener added to room: `%s`. %d registered listeners", listener.UserID, len(bus.TotalRoomListeners[listener.UserID]))

		// Remove closed client
		case listener := <-bus.ClosedListener:
			if _, exists := bus.TotalRoomListeners[listener.UserID]; !exists {
				log.Printf("Room `%s` not found", listener.UserID)
				continue
			} else {
				//loop through all the listeners in the room and remove the one that matches
				for i, v := range bus.TotalRoomListeners[listener.UserID] {
					if v.ResponseChan == listener.ResponseChan {
						bus.TotalRoomListeners[listener.UserID] = append(bus.TotalRoomListeners[listener.UserID][:i], bus.TotalRoomListeners[listener.UserID][i+1:]...)
						close(listener.ResponseChan)
						log.Printf("Removed listener from room: `%s`. %d registered clients", listener.UserID, len(bus.TotalRoomListeners[listener.UserID]))
						break
					}
				}
			}

		// Broadcast message to client
		case eventMsg := <-bus.Message:
			if _, exists := bus.TotalRoomListeners[eventMsg.UserID]; !exists {
				log.Printf("Room `%s` not found, could not send message: `%s`", eventMsg.UserID, eventMsg.Message)
				continue
			} else {
				for _, roomListener := range bus.TotalRoomListeners[eventMsg.UserID] {
					roomListener.ResponseChan <- eventMsg.Message
				}
			}

		}
	}
}

func (bus *EventBus) PublishMessage(eventMsg models.EventInterface) error {
	bus.Logger.Infof("Publishing message to room: `%s`", eventMsg.GetUserID())
	payload, err := json.Marshal(eventMsg)
	if err != nil {
		return err
	}
	bus.Message <- EventBusMessage{
		UserID:  eventMsg.GetUserID(),
		Message: string(payload),
	}
	return nil
}
