package models

import "github.com/fastenhealth/fasten-onprem/backend/pkg"

// TODO: this is a WIP.
func NewScheduledSyncBackgroundJob(schedule pkg.BackgroundJobSchedule) *BackgroundJob {
	return &BackgroundJob{
		JobType:   pkg.BackgroundJobTypeScheduledSync,
		JobStatus: pkg.BackgroundJobStatusReady, //scheduled jobs will not be processed immediately, so their status is set to READY
		Schedule:  &schedule,
	}
}
