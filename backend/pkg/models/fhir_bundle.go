package models

// FhirBundle is a FHIR Bundle resource
type FhirBundle struct {
	ResourceType string        `json:"resourceType"`
	Type         string        `json:"type"`
	Total        int           `json:"total"`
	Entry        []BundleEntry `json:"entry"`
}

// BundleEntry is an entry in a FHIR Bundle
type BundleEntry struct {
	Resource interface{} `json:"resource"`
}
