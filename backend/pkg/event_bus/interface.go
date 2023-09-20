package event_bus

import "github.com/fastenhealth/fasten-onprem/backend/pkg/models"

//go:generate mockgen -source=interface.go -destination=mock/mock_event_bus.go
type Interface interface {
	PublishMessage(eventMsg models.EventInterface) error
	AddListener(listener *EventBusListener)
	RemoveListener(listener *EventBusListener)
	TotalRooms() int
	TotalListenersByRoom(room string) int
}
