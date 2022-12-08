package models

import (
	"gorm.io/datatypes"
)

type ResourceFhir struct {
	OriginBase

	//embedded data
	ResourceRaw datatypes.JSON `json:"resource_raw" gorm:"resource_raw"`
}

type ListResourceQueryOptions struct {
	SourceID           string
	SourceResourceType string
	SourceResourceID   string
}
