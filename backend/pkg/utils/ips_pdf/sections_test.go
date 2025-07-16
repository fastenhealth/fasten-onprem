package ips_pdf

import (
	"flag"
	"testing"
	"time"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/utils/ips"
	"github.com/fastenhealth/gofhir-models/fhir401"
	"github.com/google/uuid"
	"github.com/johnfercher/maroto/v2"
	"github.com/johnfercher/maroto/v2/pkg/config"
	"github.com/johnfercher/maroto/v2/pkg/test"
	"github.com/samber/lo"
	"gorm.io/datatypes"
)

// used to update the test data files if there are changes to the render functions
var update = flag.Bool("update", false, "update test data files")

func TestRenderAllergies(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	allergies := []database.FhirAllergyIntolerance{
		{
			Code:           datatypes.JSON(`[{"text": "Penicillin"}]`),
			ClinicalStatus: datatypes.JSON(`[{"code": "active"}]`),
			Category:       datatypes.JSON(`[{"code": "medication"}]`),
			Manifestation:  datatypes.JSON(`[{"text": "Hives"}]`),
			Criticality:    datatypes.JSON(`[{"code": "high"}]`),
			Onset:          lo.ToPtr(time.Date(2021, 1, 1, 0, 0, 0, 0, time.UTC)),
		},
	}

	renderAllergies(m, allergies)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("allergies_with_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("allergies_with_data.json")
	}
}

func TestRenderAllergies_NoData(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	var allergies []database.FhirAllergyIntolerance

	renderAllergies(m, allergies)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("allergies_no_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("allergies_no_data.json")
	}
}

func TestRenderMedicationSummary(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	data := &ips.SectionData{
		MedicationRequest: []database.FhirMedicationRequest{
			{
				Code:              datatypes.JSON(`[{"text": "Lisinopril"}]`),
				Status:            datatypes.JSON(`[{"code": "active"}]`),
				Route:             datatypes.JSON(`[{"text": "Oral"}]`),
				DosageInstruction: datatypes.JSON(`[{"text": "10mg daily"}]`),
				Note:              datatypes.JSON(`[{"text": "Take with food"}]`),
				Authoredon:        lo.ToPtr(time.Date(2022, 1, 1, 0, 0, 0, 0, time.UTC)),
			},
		},
		MedicationStatement: []database.FhirMedicationStatement{
			{
				Code:              datatypes.JSON(`[{"text": "Aspirin"}]`),
				Status:            datatypes.JSON(`[{"code": "active"}]`),
				DosageInstruction: datatypes.JSON(`[{"text": "81mg daily"}]`),
				Effective:         lo.ToPtr(time.Date(2022, 1, 1, 0, 0, 0, 0, time.UTC)),
			},
		},
	}

	renderMedicationSummary(m, data)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("medication_summary_with_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("medication_summary_with_data.json")
	}
}

func TestRenderMedicationSummary_NoData(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	data := &ips.SectionData{}

	renderMedicationSummary(m, data)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("medication_summary_no_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("medication_summary_no_data.json")
	}
}

func TestRenderProblemList(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	problems := []database.FhirCondition{
		{
			Code:           datatypes.JSON(`[{"text": "Hypertension"}]`),
			ClinicalStatus: datatypes.JSON(`[{"code": "active"}]`),
			Note:           datatypes.JSON(`[{"text": "Well controlled"}]`),
			OnsetDate:      lo.ToPtr(time.Date(2020, 1, 1, 0, 0, 0, 0, time.UTC)),
		},
	}

	renderProblemList(m, problems)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("problem_list_with_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("problem_list_with_data.json")
	}
}

func TestRenderProblemList_NoData(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	var problems []database.FhirCondition

	renderProblemList(m, problems)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("problem_list_no_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("problem_list_no_data.json")
	}
}

func TestRenderImmunizations(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	immunizations := []database.FhirImmunization{
		{
			VaccineCode:  datatypes.JSON(`[{"text": "COVID-19 Vaccine"}]`),
			Status:       datatypes.JSON(`[{"code": "completed"}]`),
			DoseNumber:   datatypes.JSON(`[{"text": "2"}]`),
			Manufacturer: datatypes.JSON(`[{"display": "Pfizer"}]`),
			LotNumber:    datatypes.JSON(`[{"text": "12345"}]`),
			Date:         lo.ToPtr(time.Date(2021, 1, 1, 0, 0, 0, 0, time.UTC)),
		},
	}

	renderImmunizations(m, immunizations)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("immunizations_with_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("immunizations_with_data.json")
	}
}

func TestRenderImmunizations_NoData(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	var immunizations []database.FhirImmunization

	renderImmunizations(m, immunizations)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("immunizations_no_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("immunizations_no_data.json")
	}
}

func TestRenderHistoryOfProcedures(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	procedures := []database.FhirProcedure{
		{
			Code: datatypes.JSON(`[{"text": "Appendectomy"}]`),
			Note: datatypes.JSON(`[{"text": "No complications"}]`),
			Date: lo.ToPtr(time.Date(2015, 1, 1, 0, 0, 0, 0, time.UTC)),
		},
	}

	renderHistoryOfProcedures(m, procedures)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("history_of_procedures_with_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("history_of_procedures_with_data.json")
	}
}

func TestRenderHistoryOfProcedures_NoData(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	var procedures []database.FhirProcedure

	renderHistoryOfProcedures(m, procedures)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("history_of_procedures_no_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("history_of_procedures_no_data.json")
	}
}

func TestRenderMedicalDevices(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	devices := []database.FhirDevice{
		{
			Type:   datatypes.JSON(`[{"text": "Pacemaker"}]`),
			Status: datatypes.JSON(`[{"code": "active"}]`),
			Note:   datatypes.JSON(`[{"text": "Battery replaced in 2020"}]`),
		},
	}

	renderMedicalDevices(m, devices)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("medical_devices_with_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("medical_devices_with_data.json")
	}
}

func TestRenderMedicalDevices_NoData(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	var devices []database.FhirDevice

	renderMedicalDevices(m, devices)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("medical_devices_no_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("medical_devices_no_data.json")
	}
}

func TestRenderDiagnosticResults(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	data := &ips.SectionData{
		DiagnosticReport: []database.FhirDiagnosticReport{
			{
				Code: datatypes.JSON(`[{"text": "Lipid Panel"}]`),
				Date: lo.ToPtr(time.Date(2023, 1, 1, 0, 0, 0, 0, time.UTC)),
			},
		},
		Observation: []database.FhirObservation{
			{
				Code:           datatypes.JSON(`[{"text": "Cholesterol"}]`),
				ValueQuantity:  datatypes.JSON(`{"value": 200, "unit": "mg/dL"}`),
				Interpretation: datatypes.JSON(`[{"text": "Normal"}]`),
				ReferenceRange: datatypes.JSON(`[{"text": "<200"}]`),
				Date:           lo.ToPtr(time.Date(2023, 1, 1, 0, 0, 0, 0, time.UTC)),
			},
		},
	}

	renderDiagnosticResults(m, data)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("diagnostic_results_with_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("diagnostic_results_with_data.json")
	}
}

func TestRenderDiagnosticResults_NoData(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	data := &ips.SectionData{}

	renderDiagnosticResults(m, data)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("diagnostic_results_no_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("diagnostic_results_no_data.json")
	}
}

func TestRenderVitalSigns(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	observations := []database.FhirObservation{
		{
			Code:           datatypes.JSON(`[{"text": "Blood Pressure"}]`),
			ValueQuantity:  datatypes.JSON(`{"value": "120/80", "unit": "mmHg"}`),
			Interpretation: datatypes.JSON(`[{"text": "Normal"}]`),
			Date:           lo.ToPtr(time.Date(2023, 1, 1, 0, 0, 0, 0, time.UTC)),
		},
	}

	renderVitalSigns(m, observations)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("vital_signs_with_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("vital_signs_with_data.json")
	}
}

func TestRenderVitalSigns_NoData(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	var observations []database.FhirObservation

	renderVitalSigns(m, observations)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("vital_signs_no_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("vital_signs_no_data.json")
	}
}

func TestRenderHistoryOfIllness(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	conditions := []database.FhirCondition{
		{
			Code:           datatypes.JSON(`[{"text": "Pneumonia"}]`),
			ClinicalStatus: datatypes.JSON(`[{"code": "resolved"}]`),
			Note:           datatypes.JSON(`[{"text": "Treated with antibiotics"}]`),
			OnsetDate:      lo.ToPtr(time.Date(2019, 1, 1, 0, 0, 0, 0, time.UTC)),
		},
	}

	renderHistoryOfIllness(m, conditions)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("history_of_illness_with_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("history_of_illness_with_data.json")
	}
}

func TestRenderHistoryOfIllness_NoData(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	var conditions []database.FhirCondition

	renderHistoryOfIllness(m, conditions)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("history_of_illness_no_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("history_of_illness_no_data.json")
	}
}

func TestRenderPregnancy(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	observations := []database.FhirObservation{
		{
			Code:         datatypes.JSON(`[{"text": "Pregnancy"}]`),
			ValueConcept: datatypes.JSON(`[{"text": "Positive"}]`),
			Date:         lo.ToPtr(time.Date(2023, 1, 1, 0, 0, 0, 0, time.UTC)),
		},
	}

	renderPregnancy(m, observations)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("pregnancy_with_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("pregnancy_with_data.json")
	}
}

func TestRenderPregnancy_NoData(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	var observations []database.FhirObservation

	renderPregnancy(m, observations)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("pregnancy_no_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("pregnancy_no_data.json")
	}
}

func TestRenderSocialHistory(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	observations := []database.FhirObservation{
		{
			Code:         datatypes.JSON(`[{"text": "Smoking Status"}]`),
			ValueConcept: datatypes.JSON(`[{"text": "Never smoker"}]`),
			Date:         lo.ToPtr(time.Date(2023, 1, 1, 0, 0, 0, 0, time.UTC)),
		},
	}

	renderSocialHistory(m, observations)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("social_history_with_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("social_history_with_data.json")
	}
}

func TestRenderSocialHistory_NoData(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	var observations []database.FhirObservation

	renderSocialHistory(m, observations)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("social_history_no_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("social_history_no_data.json")
	}
}

func TestRenderPlanOfCare(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	carePlans := []database.FhirCarePlan{
		{
			ActivityCode: datatypes.JSON(`[{"text": "Follow up with cardiologist"}]`),
			Intent:       datatypes.JSON(`[{"code": "order"}]`),
			Note:         datatypes.JSON(`[{"text": "Scheduled for 2023-08-01"}]`),
			Date:         lo.ToPtr(time.Date(2023, 7, 1, 0, 0, 0, 0, time.UTC)),
		},
	}

	renderPlanOfCare(m, carePlans)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("plan_of_care_with_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("plan_of_care_with_data.json")
	}
}

func TestRenderPlanOfCare_NoData(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	var carePlans []database.FhirCarePlan

	renderPlanOfCare(m, carePlans)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("plan_of_care_no_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("plan_of_care_no_data.json")
	}
}

func TestGetHeader(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	data := &ips.InternationalPatientSummaryExportData{
		GenerationDate: time.Date(2023, 1, 1, 0, 0, 0, 0, time.UTC),
		Composition: &fhir401.Composition{
			Identifier: &fhir401.Identifier{
				System: lo.ToPtr("Test System"),
				Value:  lo.ToPtr("uuid"),
			},
		},
	}

	m.RegisterHeader(getDocumentHeader(data)...)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("header.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("header.json")
	}
}

func TestRenderPatientSection(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	patient := &database.FhirPatient{
		Name:      datatypes.JSON(`[{"text": "John Doe"}]`),
		Address:   datatypes.JSON(`["123 Main St"]`),
		Telecom:   datatypes.JSON(`[{"code": "555-555-5555"},{"code": "test@email.com"}]`),
		Birthdate: lo.ToPtr(time.Date(1970, 1, 1, 0, 0, 0, 0, time.UTC)),
	}

	renderPatientSection(m, patient)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("patient.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("patient.json")
	}
}

func TestRenderSections(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)
	sources := []models.SourceCredential{
		{
			Display: "",
			ModelBase: models.ModelBase{
				ID: uuid.MustParse("88e06eff-c2d9-4a8c-bf4d-b4c147ea8648"),
				CreatedAt: time.Date(2025, 7, 15, 0, 0, 0, 0, time.UTC),
			},
		},
		{
			Display: "Aetna (sandbox)",
			ModelBase: models.ModelBase{
				ID: uuid.MustParse("b53c77ed-c0f4-4d6a-bddf-5c0e3934c2d6"),
				CreatedAt: time.Date(2025, 7, 15, 0, 0, 0, 0, time.UTC),
			},
		},
	}
	
	renderSourcesSection(m, sources)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("sources.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("sources.json")
	}
}

func TestRenderAdvanceDirectives(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	consents := []database.FhirConsent{
		{
			Scope:  datatypes.JSON(`[{"text": "DNR"}]`),
			Status: datatypes.JSON(`[{"code": "active"}]`),
			Action: datatypes.JSON(`[{"text": "Do Not Resuscitate"}]`),
			Date:   lo.ToPtr(time.Date(2022, 1, 1, 0, 0, 0, 0, time.UTC)),
		},
	}

	renderAdvanceDirectives(m, consents)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("advance_directives_with_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("advance_directives_with_data.json")
	}
}

func TestRenderAdvanceDirectives_NoData(t *testing.T) {
	cfg := config.NewBuilder().Build()
	mrt := maroto.New(cfg)
	m := maroto.NewMetricsDecorator(mrt)

	var consents []database.FhirConsent

	renderAdvanceDirectives(m, consents)

	if *update {
		test.New(t).Assert(m.GetStructure()).Save("advance_directives_no_data.json")
	} else {
		test.New(t).Assert(m.GetStructure()).Equals("advance_directives_no_data.json")
	}
}
