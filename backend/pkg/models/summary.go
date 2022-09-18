package models

type Summary struct {
	Sources            []Source                 `json:"sources,omitempty"`
	Patients           []ResourceFhir           `json:"patients,omitempty"`
	ResourceTypeCounts []map[string]interface{} `json:"resource_type_counts,omitempty"`
}
