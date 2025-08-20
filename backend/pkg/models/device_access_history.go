package models

import (
    "time"
    "github.com/google/uuid"
)

type DeviceAccessHistory struct {
    ModelBase
    UserID      uuid.UUID `json:"user_id"`
    TokenID     string    `json:"token_id"`
    DeviceID    string    `json:"device_id"`
	EventTime   time.Time `json:"event_time"`
	Success     bool      `json:"success"`
	UserAgent   string    `json:"user_agent,omitempty"`
	DataVolume  int64     `json:"data_volume,omitempty"`
    ErrorMsg    string    `json:"error_msg,omitempty"`
    
    // Additional fields for frontend compatibility
    ClientName    string    `json:"client_name,omitempty"`
    ClientVersion string    `json:"client_version,omitempty"`
    Platform      string    `json:"platform,omitempty"`
    ConnectedAt   time.Time `json:"connected_at,omitempty"`
    LastSeen      time.Time `json:"last_seen,omitempty"`
    SyncCount     int64     `json:"sync_count,omitempty"`
    DataSynced    int64     `json:"data_synced,omitempty"`
}
