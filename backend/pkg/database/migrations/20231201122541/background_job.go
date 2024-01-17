package _20231201122541

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/google/uuid"
	"gorm.io/datatypes"
	"time"
)

type BackgroundJob struct {
	models.ModelBase
	User   models.User `json:"user,omitempty"` //SECURITY: user and user.id will be set by the repository service
	UserID uuid.UUID   `json:"user_id"`

	JobType    pkg.BackgroundJobType      `json:"job_type"`
	Data       datatypes.JSON             `gorm:"column:data;type:text;serializer:json" json:"data,omitempty"`
	JobStatus  pkg.BackgroundJobStatus    `json:"job_status"`
	LockedTime *time.Time                 `json:"locked_time"`
	DoneTime   *time.Time                 `json:"done_time"`
	Retries    int                        `json:"retries"`
	Schedule   *pkg.BackgroundJobSchedule `json:"schedule,omitempty"`
}
