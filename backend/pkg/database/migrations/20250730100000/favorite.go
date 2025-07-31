package _20250730100000

import (
	"time"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
)

type Favorite struct {
	models.ModelBase
	UserID       string `gorm:"index"`
	ResourceType string `gorm:"index"`
	ResourceID   string `gorm:"index"`
	CreatedAt    time.Time
}
