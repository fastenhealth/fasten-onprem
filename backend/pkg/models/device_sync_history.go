package models

import (
    "time"
    "github.com/google/uuid"
)

type DeviceSyncHistory struct {
    ModelBase
    UserID      uuid.UUID `json:"user_id"`
    TokenID     string    `json:"token_id"`
    DeviceID    string    `json:"device_id"`
	EventTime   time.Time `json:"event_time"`
	Success     bool      `json:"success"`
	UserAgent   string    `json:"user_agent,omitempty"`
	DataVolume  int64     `json:"data_volume,omitempty"`
    ErrorMsg    string    `json:"error_msg,omitempty"`
}
