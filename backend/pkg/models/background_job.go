package models

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
	"time"
)

type BackgroundJob struct {
	ModelBase
	User   User      `json:"user,omitempty"` //SECURITY: user and user.id will be set by the repository service
	UserID uuid.UUID `json:"user_id"`

	JobType pkg.BackgroundJobType `json:"job_type"`
	//this should be JSON encoded data from BackgroundJobSyncData or
	Data       datatypes.JSON             `gorm:"column:data;type:text;serializer:json" json:"data,omitempty"`
	JobStatus  pkg.BackgroundJobStatus    `json:"job_status"`
	LockedTime *time.Time                 `json:"locked_time"`
	DoneTime   *time.Time                 `json:"done_time"`
	Retries    int                        `json:"retries"`
	Schedule   *pkg.BackgroundJobSchedule `json:"schedule,omitempty"`
}

func (b *BackgroundJob) BeforeCreate(tx *gorm.DB) (err error) {
	if err := b.ModelBase.BeforeCreate(tx); err != nil {
		return err
	}
	if b.JobStatus == "" {
		b.JobStatus = pkg.BackgroundJobStatusReady
	}
	return
}
