package models

type SourceSummary struct {
	Source             *Source                  `json:"source,omitempty"`
	ResourceTypeCounts []map[string]interface{} `json:"resource_type_counts,omitempty"`
}
