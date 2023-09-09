package models

type EventSourceSync struct {
	*Event       `json:",inline"`
	SourceID     string `json:"source_id"`
	ResourceType string `json:"resource_type"`
	ResourceID   string `json:"resource_id"`
}

func NewEventSourceSync(userID string, sourceID string, resourceType string, resourceID string) *EventSourceSync {
	return &EventSourceSync{
		Event: &Event{
			UserID:    userID,
			EventType: EventTypeSourceSync,
		},
		SourceID:     sourceID,
		ResourceType: resourceType,
		ResourceID:   resourceID,
	}
}
