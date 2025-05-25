package models

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/google/uuid"
)

type UserPermission struct {
	ModelBase
	UserID       uuid.UUID      `json:"user_id" gorm:"type:uuid"`
	TargetUserID uuid.UUID      `json:"target_user_id" gorm:"type:uuid"`
	Permission   pkg.Permission `json:"permission"`
}
