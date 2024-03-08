package ips

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models/database"
	"github.com/fastenhealth/gofhir-models/fhir401"
	"time"
)

type InternationalPatientSummaryExportData struct {
	GenerationDate time.Time
	Bundle         *fhir401.Bundle
	Composition    *fhir401.Composition

	Patient *database.FhirPatient
	Sources []models.SourceCredential
}
