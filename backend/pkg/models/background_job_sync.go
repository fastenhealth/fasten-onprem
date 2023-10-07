package models

import (
	"encoding/json"
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/google/uuid"
	"time"
)

func NewSyncBackgroundJob(source SourceCredential) *BackgroundJob {
	now := time.Now()
	data := BackgroundJobSyncData{
		SourceID:       source.ID,
		SourceType:     string(source.SourceType),
		CheckpointData: nil,
		ErrorData:      nil,
	}

	dataJson, _ := json.Marshal(data)

	return &BackgroundJob{
		JobType:    pkg.BackgroundJobTypeSync,
		JobStatus:  pkg.BackgroundJobStatusLocked, //we lock the job immediately so that it doesn't get picked up by another worker
		LockedTime: &now,
		Data:       dataJson,
	}
}

type BackgroundJobSyncData struct {
	SourceID       uuid.UUID              `json:"source_id"`
	SourceType     string                 `json:"source_type"`
	CheckpointData map[string]interface{} `json:"checkpoint_data,omitempty"`
	ErrorData      map[string]interface{} `json:"error_data,omitempty"`
}
