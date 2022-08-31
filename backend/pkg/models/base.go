package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

type ModelBase struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time `gorm:"index"`
}

//https://medium.com/@the.hasham.ali/how-to-use-uuid-key-type-with-gorm-cc00d4ec7100

func (base *ModelBase) BeforeCreate(tx *gorm.DB) error {
	base.ID = uuid.New()
	return nil
}

type OriginBase struct {
	ModelBase
	User   User      `json:"user" gorm:"-"`
	UserID uuid.UUID `json:"user_id"`

	Source   Source    `json:"source" gorm:"-"`
	SourceID uuid.UUID `json:"source_id" gorm:"not null;index:,unique,composite:source_resource_id"`

	SourceResourceType string `json:"source_resource_type" gorm:"not null;index:,unique,composite:source_resource_id"`
	SourceResourceID   string `json:"source_resource_id" gorm:"not null;index:,unique,composite:source_resource_id"`
}

func (o OriginBase) GetSourceID() uuid.UUID {
	return o.SourceID
}

func (o OriginBase) GetSourceResourceType() string {
	return o.SourceResourceType
}
func (o OriginBase) GetSourceResourceID() string {
	return o.SourceResourceID
}

type OriginBaser interface {
	GetSourceID() uuid.UUID
	GetSourceResourceType() string
	GetSourceResourceID() string
}
