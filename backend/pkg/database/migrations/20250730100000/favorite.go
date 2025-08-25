package _20250730100000

import (
	"time"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
)

type Favorite struct {
	models.ModelBase
	UserID       string `gorm:"index;uniqueIndex:idx_fav_user_source_res"`
	SourceID     string `gorm:"index;uniqueIndex:idx_fav_user_source_res"`
	ResourceType string `gorm:"index;uniqueIndex:idx_fav_user_source_res"`
	ResourceID   string `gorm:"index;uniqueIndex:idx_fav_user_source_res"`
	CreatedAt    time.Time
}
