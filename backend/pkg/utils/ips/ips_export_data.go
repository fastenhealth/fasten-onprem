package ips

import (
	"reflect"
	"time"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models/database"
	"github.com/fastenhealth/gofhir-models/fhir401"
)

type SectionData struct {
	MedicationRequest   []database.FhirMedicationRequest
	MedicationStatement []database.FhirMedicationStatement
	DiagnosticReport    []database.FhirDiagnosticReport
	Observation         []database.FhirObservation
	AllergyIntolerance  []database.FhirAllergyIntolerance
	Immunization        []database.FhirImmunization
	Condition           []database.FhirCondition
	Procedure           []database.FhirProcedure
	Device              []database.FhirDevice
	CarePlan            []database.FhirCarePlan
	Consent             []database.FhirConsent
	ClinicalImpression  []database.FhirClinicalImpression
	Encounter           []database.FhirEncounter
}

type InternationalPatientSummaryExportData struct {
	GenerationDate time.Time
	Bundle         *fhir401.Bundle
	Composition    *fhir401.Composition

	Patient *database.FhirPatient
	Sources []models.SourceCredential

	SectionResources map[pkg.IPSSections]*SectionData
}

func (s *SectionData) GetAllSectionResources() []database.IFhirResourceModel {
	resources := make([]database.IFhirResourceModel, 0)

	appendResources := func(slice interface{}) {
		v := reflect.ValueOf(slice)
		for i := 0; i < v.Len(); i++ {

			resources = append(resources, v.Index(i).Addr().Interface().(database.IFhirResourceModel))
		}
	}

	appendResources(s.MedicationRequest)
	appendResources(s.MedicationStatement)
	appendResources(s.DiagnosticReport)
	appendResources(s.Observation)
	appendResources(s.AllergyIntolerance)
	appendResources(s.Immunization)
	appendResources(s.Condition)
	appendResources(s.Procedure)
	appendResources(s.Device)
	appendResources(s.CarePlan)
	appendResources(s.Consent)
	appendResources(s.ClinicalImpression)
	appendResources(s.Encounter)

	return resources
}

func (s *SectionData) PopulateSectionDataFromQuery(queryResults interface{}) {
	switch res := queryResults.(type) {
	case []database.FhirMedicationRequest:
		s.MedicationRequest = append(s.MedicationRequest, res...)
	case []database.FhirMedicationStatement:
		s.MedicationStatement = append(s.MedicationStatement, res...)
	case []database.FhirDiagnosticReport:
		s.DiagnosticReport = append(s.DiagnosticReport, res...)
	case []database.FhirObservation:
		s.Observation = append(s.Observation, res...)
	case []database.FhirAllergyIntolerance:
		s.AllergyIntolerance = append(s.AllergyIntolerance, res...)
	case []database.FhirImmunization:
		s.Immunization = append(s.Immunization, res...)
	case []database.FhirCondition:
		s.Condition = append(s.Condition, res...)
	case []database.FhirProcedure:
		s.Procedure = append(s.Procedure, res...)
	case []database.FhirDevice:
		s.Device = append(s.Device, res...)
	case []database.FhirCarePlan:
		s.CarePlan = append(s.CarePlan, res...)
	case []database.FhirConsent:
		s.Consent = append(s.Consent, res...)
	case []database.FhirClinicalImpression:
		s.ClinicalImpression = append(s.ClinicalImpression, res...)
	case []database.FhirEncounter:
		s.Encounter = append(s.Encounter, res...)
	}
}
