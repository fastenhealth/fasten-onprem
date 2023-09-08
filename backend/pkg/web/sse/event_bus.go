package sse

import (
	"fmt"
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
func GetEventBusServer() *EventBus {
	if singletonEventBusInstance == nil {
		eventBusLock.Lock()
		defer eventBusLock.Unlock()
		if singletonEventBusInstance == nil {
			fmt.Println("Creating single instance now.")
			singletonEventBusInstance = &EventBus{
				Message:       make(chan string),
				NewClients:    make(chan chan string),
				ClosedClients: make(chan chan string),
				TotalClients:  make(map[chan string]bool),
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
	// Events are pushed to this channel by the main events-gathering routine
	Message chan string

	// New client connections
	NewClients chan chan string

	// Closed client connections
	ClosedClients chan chan string

	// Total client connections
	TotalClients map[chan string]bool
}

// It Listens all incoming requests from clients.
// Handles addition and removal of clients and broadcast messages to clients.
func (bus *EventBus) listen() {
	for {
		select {
		// Add new available client
		case client := <-bus.NewClients:
			bus.TotalClients[client] = true
			log.Printf("Client added. %d registered clients", len(bus.TotalClients))

		// Remove closed client
		case client := <-bus.ClosedClients:
			delete(bus.TotalClients, client)
			close(client)
			log.Printf("Removed client. %d registered clients", len(bus.TotalClients))

		// Broadcast message to client
		case eventMsg := <-bus.Message:
			for clientMessageChan := range bus.TotalClients {
				clientMessageChan <- eventMsg
			}
		}
	}
}
