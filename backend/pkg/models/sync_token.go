package models

import (
	"time"
	"github.com/google/uuid"
)

// SyncToken represents a sync token stored in the database
type SyncToken struct {
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
	UserAgent   string    `json:"user_agent"`                              // Device/app that created the token
	
	// Token lifecycle
	IssuedAt     time.Time  `json:"issued_at"`
	ExpiresAt    time.Time  `json:"expires_at"`
	LastUsedAt   *time.Time `json:"last_used_at,omitempty"`
	RevokedAt    *time.Time `json:"revoked_at,omitempty"`
	RevokedBy    string     `json:"revoked_by,omitempty"`                   // How it was revoked (user, system, expired)
	
	// Status tracking
	IsActive     bool   `json:"is_active" gorm:"default:true"`
	IsRevoked    bool   `json:"is_revoked" gorm:"default:false"`
	
	// Connection metadata
	ServerName   string `json:"server_name"`
	ServerHost   string `json:"server_host"`
	ServerPort   string `json:"server_port"`
	
	// Usage statistics
	UseCount     int64     `json:"use_count" gorm:"default:0"`
	
	// Security features
	Scopes       string    `json:"scopes"`                                  // Comma-separated scopes
	Restrictions string    `json:"restrictions,omitempty"`                  // JSON string for IP restrictions, etc.
}

// SyncTokenHistory represents a history entry for sync token usage
type SyncTokenHistory struct {
	//GORM Model
	ModelBase
	
	// Reference to the token
	TokenID    string    `json:"token_id" gorm:"index"`
	UserID     uuid.UUID `json:"user_id" gorm:"index"`
	
	
	// Event details
	EventType  string    `json:"event_type"`  // created, used, revoked, expired
	EventTime  time.Time `json:"event_time"`
	UserAgent  string    `json:"user_agent"`
	
	// Additional metadata
	Metadata   string    `json:"metadata,omitempty"` // JSON string for additional event data
	Success    bool      `json:"success" gorm:"default:true"`
	ErrorMsg   string    `json:"error_msg,omitempty"`
}

// SyncTokenStatus represents different token statuses
type SyncTokenStatus string

const (
	SyncTokenStatusActive     SyncTokenStatus = "active"
	SyncTokenStatusExpired    SyncTokenStatus = "expired"
	SyncTokenStatusRevoked    SyncTokenStatus = "revoked"
	SyncTokenStatusSuspended  SyncTokenStatus = "suspended"
)

// SyncConnection represents active sync connections
type SyncConnection struct {
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

// Helper methods for SyncToken

// IsExpired checks if the token has expired
func (st *SyncToken) IsExpired() bool {
	return time.Now().After(st.ExpiresAt)
}

// IsValid checks if the token is valid and usable
func (st *SyncToken) IsValid() bool {
	return st.IsActive && !st.IsRevoked && !st.IsExpired()
}

// GetStatus returns the current status of the token
func (st *SyncToken) GetStatus() SyncTokenStatus {
	if st.IsRevoked {
		return SyncTokenStatusRevoked
	}
	if st.IsExpired() {
		return SyncTokenStatusExpired
	}
	if !st.IsActive {
		return SyncTokenStatusSuspended
	}
	return SyncTokenStatusActive
}

// TimeUntilExpiration returns the duration until token expires
func (st *SyncToken) TimeUntilExpiration() time.Duration {
	if st.IsExpired() {
		return 0
	}
	return st.ExpiresAt.Sub(time.Now())
}

// DaysSinceLastUse returns days since token was last used
func (st *SyncToken) DaysSinceLastUse() int {
	if st.LastUsedAt == nil {
		return -1 // Never used
	}
	return int(time.Since(*st.LastUsedAt).Hours() / 24)
}

// MarkAsUsed updates the last used timestamp and increments use count
func (st *SyncToken) MarkAsUsed() {
	now := time.Now()
	st.LastUsedAt = &now
	st.UseCount++
}

// Revoke marks the token as revoked
func (st *SyncToken) Revoke(revokedBy string) {
	now := time.Now()
	st.RevokedAt = &now
	st.RevokedBy = revokedBy
	st.IsRevoked = true
	st.IsActive = false
}
