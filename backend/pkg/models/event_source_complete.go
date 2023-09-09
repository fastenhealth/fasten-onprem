package models

type EventSourceComplete struct {
	*Event   `json:",inline"`
	SourceID string `json:"source_id"`
}

func NewEventSourceComplete(userID string, sourceID string) *EventSourceComplete {
	return &EventSourceComplete{
		Event: &Event{
			UserID:    userID,
			EventType: EventTypeSourceComplete,
		},
		SourceID: sourceID,
	}
}
