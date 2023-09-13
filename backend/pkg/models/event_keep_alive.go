package models

import "time"

type EventKeepAlive struct {
	*Event `json:",inline"`
	Time   string `json:"time"`
}

func NewEventKeepAlive(userID string) *EventKeepAlive {
	return &EventKeepAlive{
		Event: &Event{
			UserID:    userID,
			EventType: EventTypeKeepAlive,
		},
		Time: time.Now().Format("2006-01-02 15:04:05"),
	}
}
