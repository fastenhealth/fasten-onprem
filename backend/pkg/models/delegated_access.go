package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AccessLevel string

const (
	AccessView AccessLevel = "VIEW"
	AccessEdit AccessLevel = "EDIT"
)

type DelegatedAccess struct {
	ID             uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey"`
	OwnerUserID    uuid.UUID      `json:"owner_user_id" gorm:"type:uuid;not null;index"`
	DelegateUserID string         `json:"delegate_user_id" gorm:"type:uuid;not null;index"`
	ResourceType   string         `json:"resource_type" gorm:"type:text;not null"`
	ResourceID     string         `json:"resource_id" gorm:"type:uuid;not null;index"`
	AccessLevel    AccessLevel    `json:"access_level" gorm:"type:text;not null"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `json:"-" gorm:"index"`
}

func (d *DelegatedAccess) BeforeCreate(tx *gorm.DB) (err error) {
	d.ID = uuid.New()
	return
}
