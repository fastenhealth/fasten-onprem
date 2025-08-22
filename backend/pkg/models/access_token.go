package models

import (
	"time"
	"github.com/google/uuid"
)

// AccessToken represents an access token stored in the database
type AccessToken struct {
	//GORM Model
	ModelBase
	
	// User who owns this token
	UserID uuid.UUID `json:"user_id"`
	User   User      `json:"user,omitempty"`
	
	// Token identification
	TokenID    string `json:"token_id" gorm:"uniqueIndex;not null"`
	TokenHash  string `json:"-" gorm:"not null"` // Hashed version of actual token for security
	
	// Token metadata
	Name        string    `json:"name"`                                    // User-friendly name
	Description string    `json:"description"`                             // Optional description
	
	// Token lifecycle
	IssuedAt     time.Time  `json:"issued_at"`
	ExpiresAt    time.Time  `json:"expires_at"`
	LastUsedAt   *time.Time `json:"last_used_at,omitempty"`

	
	// Status tracking
	IsActive     bool   `json:"is_active" gorm:"default:true"`

	
	// Usage statistics
	UseCount     int64     `json:"use_count" gorm:"default:0"`
	
	// Security features
	Scopes       string    `json:"scopes"`                                  // Comma-separated scopes
	Restrictions string    `json:"restrictions,omitempty"`                  // JSON string for IP restrictions, etc.
}

// AccessTokenHistory represents a history entry for access token usage
type AccessTokenHistory struct {
	//GORM Model
	ModelBase
	
	// Reference to the token
	TokenID    string    `json:"token_id" gorm:"index"`
	UserID     uuid.UUID `json:"user_id" gorm:"index"`
	
	
	// Event details
	EventType  string    `json:"event_type"`  // created, used, revoked, expired
	EventTime  time.Time `json:"event_time"`
	
	// Additional metadata
	Metadata   string    `json:"metadata,omitempty"` // JSON string for additional event data
	Success    bool      `json:"success" gorm:"default:true"`
	ErrorMsg   string    `json:"error_msg,omitempty"`
}

// AccessTokenStatus represents different token statuses
type AccessTokenStatus string

const (
	AccessTokenStatusActive     AccessTokenStatus = "active"
	AccessTokenStatusExpired    AccessTokenStatus = "expired"

	AccessTokenStatusSuspended  AccessTokenStatus = "suspended"
)

// AccessConnection represents active access connections
type AccessConnection struct {
	//GORM Model  
	ModelBase
	
	// Connection details
	TokenID       string    `json:"token_id" gorm:"index"`
	
	
	// Client information
	ClientName    string    `json:"client_name"`    // App name (e.g., "Health Wallet")
	ClientVersion string    `json:"client_version"` // App version
	DeviceID      string    `json:"device_id"`      // Unique device identifier
	Platform      string    `json:"platform"`       // iOS, Android, Web
	
	// Connection status
	IsConnected   bool      `json:"is_connected" gorm:"default:true"`
	LastSeen      time.Time `json:"last_seen"`
	ConnectedAt   time.Time `json:"connected_at"`
	DisconnectedAt *time.Time `json:"disconnected_at,omitempty"`
	
	// Sync statistics
	SyncCount     int64     `json:"sync_count" gorm:"default:0"`
	LastSyncAt    *time.Time `json:"last_sync_at,omitempty"`
	DataSynced    int64     `json:"data_synced" gorm:"default:0"` // Bytes synced
	
	// Network info
	Location      string    `json:"location,omitempty"` // Geo location if available
}

// Helper methods for AccessToken

// IsExpired checks if the token has expired
func (at *AccessToken) IsExpired() bool {
	return time.Now().After(at.ExpiresAt)
}

// IsValid checks if the token is valid and usable
func (at *AccessToken) IsValid() bool {
	return at.IsActive && !at.IsExpired()
}

// GetStatus returns the current status of the token
func (at *AccessToken) GetStatus() AccessTokenStatus {

	if at.IsExpired() {
		return AccessTokenStatusExpired
	}
	if !at.IsActive {
		return AccessTokenStatusSuspended
	}
	return AccessTokenStatusActive
}

// TimeUntilExpiration returns the duration until token expires
func (at *AccessToken) TimeUntilExpiration() time.Duration {
	if at.IsExpired() {
		return 0
	}
	return at.ExpiresAt.Sub(time.Now())
}

// DaysSinceLastUse returns days since token was last used
func (at *AccessToken) DaysSinceLastUse() int {
	if at.LastUsedAt == nil {
		return -1 // Never used
	}
	return int(time.Since(*at.LastUsedAt).Hours() / 24)
}

// MarkAsUsed updates the last used timestamp and increments use count
func (at *AccessToken) MarkAsUsed() {
	now := time.Now()
	at.LastUsedAt = &now
	at.UseCount++
}


