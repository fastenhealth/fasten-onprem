package models

import (
	"gorm.io/datatypes"
)

type ResourceFhir struct {
	OriginBase

	//embedded data
	RawResource datatypes.JSON `json:"raw_resource" gorm:"raw_resource"`
}

type ListResourceQueryOptions struct {
	SourceID           string
	SourceResourceType string
}
