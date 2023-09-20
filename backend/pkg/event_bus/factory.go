package event_bus

import (
	"fmt"
	"github.com/sirupsen/logrus"
)

func NewEventBusServer(logger logrus.FieldLogger) Interface {
	fmt.Println("Creating event bus instance now.")
	eventBusInstance := &eventBus{
		logger:             logger,
		message:            make(chan EventBusMessage),
		newListener:        make(chan *EventBusListener),
		closedListener:     make(chan *EventBusListener),
		totalRoomListeners: make(map[string][]*EventBusListener),
	}

	// Start processing requests
	go eventBusInstance.listen()
	return eventBusInstance
}

func NewNoopEventBusServer() Interface {
	return &noopEventBus{}
}
