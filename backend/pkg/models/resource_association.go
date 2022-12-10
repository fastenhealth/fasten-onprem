package models

type ResourceAssociation struct {
	SourceID           string `json:"source_id"`
	SourceResourceType string `json:"source_resource_type"`
	SourceResourceID   string `json:"source_resource_id"`

	OldRelatedSourceID           string `json:"old_related_source_id"`
	OldRelatedSourceResourceType string `json:"old_related_source_resource_type"`
	OldRelatedSourceResourceID   string `json:"old_related_source_resource_id"`

	NewRelatedSourceID           string `json:"new_related_source_id"`
	NewRelatedSourceResourceType string `json:"new_related_source_resource_type"`
	NewRelatedSourceResourceID   string `json:"new_related_source_resource_id"`
}
