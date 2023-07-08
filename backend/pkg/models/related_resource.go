package models

import "github.com/google/uuid"

//this model is used by the DB (see ResourceAssociation for web model)
type RelatedResource struct {
	ResourceBaseUserID             uuid.UUID `gorm:"resource_base_user_id"`
	ResourceBaseSourceID           uuid.UUID `gorm:"resource_base_source_id"`
	ResourceBaseSourceResourceType string    `gorm:"resource_base_source_resource_type"`
	ResourceBaseSourceResourceID   string    `gorm:"resource_base_source_resource_id"`

	RelatedResourceUserID             uuid.UUID `gorm:"related_resource_user_id"`
	RelatedResourceSourceID           uuid.UUID `gorm:"related_resource_source_id"`
	RelatedResourceSourceResourceType string    `gorm:"related_resource_source_resource_type"`
	RelatedResourceSourceResourceID   string    `gorm:"related_resource_source_resource_id"`
}
