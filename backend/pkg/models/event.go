package models

type EventSourceSyncStatus string

const (
	EventTypeKeepAlive      EventSourceSyncStatus = "keep_alive"
	EventTypeSourceSync     EventSourceSyncStatus = "source_sync"
	EventTypeSourceComplete EventSourceSyncStatus = "source_complete"
)

type EventInterface interface {
	GetUserID() string
}

type Event struct {
	UserID    string                `json:"-"`
	EventType EventSourceSyncStatus `json:"event_type"`
}

func (e *Event) GetUserID() string {
	return e.UserID
}
