package models

import (
	"gorm.io/datatypes"
	"time"
)

type ResourceBase struct {
	OriginBase

	SortDate  *time.Time `json:"sort_date" gorm:"sort_date"`
	SortTitle *string    `json:"sort_title" gorm:"sort_title"`

	// The raw resource content in JSON format
	ResourceRaw datatypes.JSON `gorm:"column:resource_raw;type:text;serializer:json" json:"resource_raw,omitempty"`

	//relationships
	RelatedResource []*ResourceBase `json:"related_resources" gorm:"many2many:related_resources;ForeignKey:user_id,source_id,source_resource_type,source_resource_id;references:user_id,source_id,source_resource_type,source_resource_id;"`
}

func (s *ResourceBase) SetOriginBase(originBase OriginBase) {
	s.OriginBase = originBase
}
