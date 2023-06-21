package models

import "github.com/google/uuid"

//this model is used by the DB (see ResourceAssociation for web model)
type RelatedResource struct {
	ResourceFhirUserID             uuid.UUID `gorm:"resource_base_user_id"`
	ResourceFhirSourceID           uuid.UUID `gorm:"resource_base_source_id"`
	ResourceFhirSourceResourceType string    `gorm:"resource_base_source_resource_type"`
	ResourceFhirSourceResourceID   string    `gorm:"resource_base_source_resource_id"`

	RelatedResourceFhirUserID             uuid.UUID `gorm:"related_resource_user_id"`
	RelatedResourceFhirSourceID           uuid.UUID `gorm:"related_resource_source_id"`
	RelatedResourceFhirSourceResourceType string    `gorm:"related_resource_source_resource_type"`
	RelatedResourceFhirSourceResourceID   string    `gorm:"related_resource_source_resource_id"`
}
