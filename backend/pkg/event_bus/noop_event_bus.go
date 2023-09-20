package event_bus

import "github.com/fastenhealth/fasten-onprem/backend/pkg/models"

type noopEventBus struct {
}

func (bus *noopEventBus) PublishMessage(eventMsg models.EventInterface) error { return nil }
func (bus *noopEventBus) AddListener(listener *EventBusListener)              {}
func (bus *noopEventBus) RemoveListener(listener *EventBusListener)           {}
func (bus *noopEventBus) TotalRooms() int                                     { return 0 }
func (bus *noopEventBus) TotalListenersByRoom(room string) int                { return 0 }
