package models

import "github.com/fastenhealth/fasten-onprem/backend/pkg"

type BackgroundJobQueryOptions struct {
	JobType *pkg.BackgroundJobType
	Status  *pkg.BackgroundJobStatus

	//pagination
	Limit  int
	Offset int
}
