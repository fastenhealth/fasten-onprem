package models

type SourceSummary struct {
	Source             *SourceCredential        `json:"source,omitempty"`
	ResourceTypeCounts []map[string]interface{} `json:"resource_type_counts,omitempty"`
	Patient            *ResourceFhir            `json:"patient"`
}
