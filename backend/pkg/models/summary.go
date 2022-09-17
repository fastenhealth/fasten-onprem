package models

type Summary struct {
	Sources            []Source                 `json:"sources,omitempty"`
	ResourceTypeCounts []map[string]interface{} `json:"resource_type_counts,omitempty"`
}
