package models

import "time"

type Favorite struct {
	ModelBase
	UserID       string `gorm:"not null;index:idx_user_source_type_id,unique"`
	SourceID     string `gorm:"not null;index:idx_user_source_type_id,unique"`
	ResourceType string `gorm:"not null;index:idx_user_source_type_id,unique"`
	ResourceID   string `gorm:"not null;index:idx_user_source_type_id,unique"`
	CreatedAt    time.Time
}
