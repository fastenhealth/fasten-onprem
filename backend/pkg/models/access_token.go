package models

import (
	"time"

	"github.com/google/uuid"
)

// AccessToken represents an access token stored in the database; used for companion app
type AccessToken struct {
	ModelBase

	UserID       uuid.UUID `json:"user_id"`
	TokenID      string    `json:"token_id" gorm:"uniqueIndex;not null"`
	Name         string    `json:"name"`
	IssuedAt     time.Time `json:"issued_at"`
	ExpiresAt    time.Time `json:"expires_at"`
}
