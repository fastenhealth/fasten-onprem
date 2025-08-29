package models

import (
	"crypto/sha256"
	"encoding/hex"
	"time"

	"github.com/google/uuid"
)

// AccessToken represents an access token stored in the database; used for companion app
type AccessToken struct {
	ModelBase

	UserID       uuid.UUID `json:"user_id"`
	TokenID      string    `json:"token_id" gorm:"uniqueIndex;not null"`
	TokenHash    string    `json:"-" gorm:"not null"`
	Name         string    `json:"name"`
	IssuedAt     time.Time `json:"issued_at"`
	ExpiresAt    time.Time `json:"expires_at"`
}

func (at *AccessToken) IsExpired() bool {
	return time.Now().After(at.ExpiresAt)
}

func HashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}