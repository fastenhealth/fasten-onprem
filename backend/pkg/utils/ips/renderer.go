package ips

// IPSRenderer defines the contract for any IPS document renderer.
// It provides a unified interface for generating different document formats
// from the same underlying InternationalPatientSummaryExportData.
type IPSRenderer interface {
	// Render generates the document from the provided raw FHIR data.
	Render(data *InternationalPatientSummaryExportData) ([]byte, error)

	// ContentType returns the MIME type for the HTTP response.
	ContentType() string

	// FileExtension returns the appropriate file extension for the output.
	FileExtension() string
}
