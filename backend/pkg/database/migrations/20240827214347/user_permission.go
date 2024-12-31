package _20240827214347

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/google/uuid"
)

type Permission string

const (
	PermissionManageSources Permission = "manage_sources"
	PermissionRead          Permission = "read"
)

type UserPermission struct {
	models.ModelBase
	UserID       uuid.UUID  `json:"user_id" gorm:"type:uuid"`
	TargetUserID uuid.UUID  `json:"target_user_id" gorm:"type:uuid"`
	Permission   Permission `json:"permission"`
}
