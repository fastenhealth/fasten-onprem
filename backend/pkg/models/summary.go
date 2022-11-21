package models

type Summary struct {
	Sources            []SourceCredential       `json:"sources"`
	Patients           []ResourceFhir           `json:"patients"`
	ResourceTypeCounts []map[string]interface{} `json:"resource_type_counts"`
}
