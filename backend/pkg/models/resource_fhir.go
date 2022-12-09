package models

import (
	"gorm.io/datatypes"
)

type ResourceFhir struct {
	OriginBase

	//embedded data
	ResourceRaw datatypes.JSON `json:"resource_raw" gorm:"resource_raw"`

	//relationships
	RelatedResourceFhir []*ResourceFhir `gorm:"many2many:related_resources"`
}

type ListResourceQueryOptions struct {
	SourceID           string
	SourceResourceType string
	SourceResourceID   string
}
