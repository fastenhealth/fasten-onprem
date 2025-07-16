package database

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/TwiN/deepmerge"
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/utils/ips"
	"github.com/fastenhealth/gofhir-models/fhir401"
	"github.com/google/uuid"
	"github.com/samber/lo"
)

// returns IPSBundle and IPSComposition
func (gr *GormRepository) GetInternationalPatientSummaryExport(ctx context.Context) (*ips.InternationalPatientSummaryExportData, error) {
	exportData := &ips.InternationalPatientSummaryExportData{}

	summaryTime := time.Now()
	timestamp := summaryTime.Format(time.RFC3339)

	exportData.GenerationDate = summaryTime

	patient, err := gr.GetPatientMerged(ctx)
	if err != nil {
		return exportData, err
	}
	exportData.Patient = patient

	sources, err := gr.GetSources(ctx)
	if err != nil {
		return exportData, err
	}
	exportData.Sources = sources

	htmlRenderer, err := ips.NewHTMLRenderer()
	if err != nil {
		return exportData, fmt.Errorf("error creating narrative engine: %w", err)
	}

	summarySectionResources, err := gr.getInternationalPatientSummarySectionResources(ctx)
	if err != nil {
		return exportData, err
	}
	exportData.SectionResources = summarySectionResources

	compositionSections := []fhir401.CompositionSection{}

	for _, requiredSection := range pkg.IPSSectionGroupsOrdered[pkg.IPSSectionGroupsRequired] {
		if sectionData, ok := summarySectionResources[requiredSection]; ok {
			compositionSection, err := generateIPSCompositionSection(requiredSection, sectionData, *htmlRenderer)
			if err != nil {
				return exportData, err
			}
			compositionSections = append(compositionSections, *compositionSection)
		}
	}
	for _, recommendedSection := range pkg.IPSSectionGroupsOrdered[pkg.IPSSectionGroupsRecommended] {
		if sectionData, ok := summarySectionResources[recommendedSection]; ok {
			compositionSection, err := generateIPSCompositionSection(recommendedSection, sectionData, *htmlRenderer)
			if err != nil {
				return exportData, err
			}
			compositionSections = append(compositionSections, *compositionSection)
		}
	}
	for _, optionalSection := range pkg.IPSSectionGroupsOrdered[pkg.IPSSectionGroupsOptional] {
		if sectionData, ok := summarySectionResources[optionalSection]; ok {
			compositionSection, err := generateIPSCompositionSection(optionalSection, sectionData, *htmlRenderer)
			if err != nil {
				return exportData, err
			}
			compositionSections = append(compositionSections, *compositionSection)
		}
	}

	compositionUUID := uuid.New().String()
	patientReference := fmt.Sprintf("%s/%s", exportData.Patient.GetSourceResourceType(), exportData.Patient.GetSourceResourceID())

	ipsComposition := &fhir401.Composition{
		Id: stringPtr(compositionUUID),
		Identifier: &fhir401.Identifier{
			System: stringPtr("https://www.fastenhealth.com"),
			Value:  &compositionUUID,
		},
		Status: fhir401.CompositionStatusFinal,
		Type: fhir401.CodeableConcept{
			Coding: []fhir401.Coding{
				{
					System:  stringPtr("http://loinc.org"),
					Code:    stringPtr("60591-5"),
					Display: stringPtr("Patient Summary"),
				},
			},
		},
		Subject: &fhir401.Reference{
			Reference: stringPtr(patientReference),
		},
		Date: timestamp,
		Author: []fhir401.Reference{
			{
				Reference: stringPtr("Organization/fastenhealth.com"),
			},
		},
		Title: fmt.Sprintf("Patient Summary as of %s", summaryTime.Format("January 2, 2006 15:04")),
		Attester: []fhir401.CompositionAttester{
			{
				Mode: fhir401.CompositionAttestationModePersonal,
				Time: &timestamp,
				Party: &fhir401.Reference{
					Reference: stringPtr(patientReference),
				},
			},
		},
		Custodian: &fhir401.Reference{
			Reference: stringPtr("Organization/fastenhealth.com"),
		},
		Event: []fhir401.CompositionEvent{
			{
				Code: []fhir401.CodeableConcept{
					{
						Coding: []fhir401.Coding{
							{
								System: stringPtr("http://terminology.hl7.org/CodeSystem/v3-ActClass"),
								Code:   stringPtr("PCPR"),
							},
						},
					},
				},
				Period: &fhir401.Period{
					Start: &timestamp,
					End:   &timestamp,
				},
			},
		},
	}
	ipsComposition.Section = compositionSections

	bundleUUID := uuid.New().String()
	ipsBundle := &fhir401.Bundle{
		Id:        &bundleUUID,
		Timestamp: &timestamp,
		Language:  stringPtr("en-US"),
		Entry:     []fhir401.BundleEntry{},
		Type:      fhir401.BundleTypeDocument,
	}

	ipsCompositionJson, err := json.Marshal(ipsComposition)
	if err != nil {
		return exportData, err
	}
	ipsBundle.Entry = append(ipsBundle.Entry, fhir401.BundleEntry{
		Resource: json.RawMessage(ipsCompositionJson),
	})

	exportData.Bundle = ipsBundle
	exportData.Composition = ipsComposition

	return exportData, nil
}

// GetInternationalPatientSummary will generate an IPS bundle, which can then be used to generate a IPS QR code, PDF or JSON bundle
// The IPS bundle will contain a summary of all the data in the system, including a list of all sources, and the main Patient
// See: https://github.com/fastenhealth/fasten-onprem/issues/170
// See: https://github.com/jddamore/fhir-ips-server/blob/main/docs/Summary_Creation_Steps.md
func (gr *GormRepository) getInternationalPatientSummarySectionResources(ctx context.Context) (map[pkg.IPSSections]*ips.SectionData, error) {
	summarySectionResources := map[pkg.IPSSections]*ips.SectionData{}

	for _, sectionName := range pkg.IPSSectionsList {
		summarySectionResources[sectionName] = &ips.SectionData{}

		queries, err := gr.generateIPSSectionQueries(ctx, sectionName)
		if err != nil {
			return nil, err
		}

		for _, query := range queries {
			results, err := gr.QueryResources(ctx, query)

			if err != nil {
				return nil, err
			}

			summarySectionResources[sectionName].PopulateSectionDataFromQuery(results)
		}
	}

	return summarySectionResources, nil
}

func generateIPSCompositionSection(sectionType pkg.IPSSections, sectionData *ips.SectionData, htmlRenderer ips.HTMLRenderer) (*fhir401.CompositionSection, error) {
	sectionTitle, sectionCode, err := generateIPSSectionHeaderInfo(sectionType)
	if err != nil {
		return nil, err
	}

	section := &fhir401.CompositionSection{
		Title: &sectionTitle,
		Code:  &sectionCode,
	}

	resources := sectionData.GetAllSectionResources()

	if len(resources) == 0 {
		section.EmptyReason = &fhir401.CodeableConcept{
			Text: stringPtr("No data available"),
			Coding: []fhir401.Coding{
				{
					System: stringPtr("http://terminology.hl7.org/CodeSystem/list-empty-reason"),
					Code:   stringPtr("unavailable"),
				},
			},
		}
	} else {
		section.Entry = []fhir401.Reference{}
		for _, resource := range resources {
			reference := fhir401.Reference{
				Reference: stringPtr(fmt.Sprintf("%s/%s", resource.GetSourceResourceType(), resource.GetSourceResourceID())),
			}
			section.Entry = append(section.Entry, reference)
		}

		rendered, err := htmlRenderer.RenderSection(sectionType, sectionData)
		if err != nil {
			return nil, fmt.Errorf("error rendering narrative for section %s: %w", sectionType, err)
		}

		section.Text = &fhir401.Narrative{
			Status: fhir401.NarrativeStatusGenerated,
			Div:    rendered,
		}
	}
	return section, nil
}

// https://github.com/jddamore/fhir-ips-server/blob/main/docs/Summary_Creation_Steps.md
// Generate Resource Queries for each IPS Section
func (gr *GormRepository) generateIPSSectionQueries(ctx context.Context, sectionType pkg.IPSSections) ([]models.QueryResource, error) {

	queries := []models.QueryResource{}
	switch sectionType {
	case pkg.IPSSectionsAllergiesIntolerances:
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   "AllergyIntolerance",
			Where: map[string]interface{}{
				"clinicalStatus:not":     []string{"inactive", "resolved"},
				"verificationStatus:not": []string{"entered-in-error"},
			},
		})

	case pkg.IPSSectionsProblemList:
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   "Condition",
			Where: map[string]interface{}{
				"clinicalStatus:not":     []string{"inactive", "resolved"},
				"verificationStatus:not": []string{"entered-in-error"},
			},
		})

	case pkg.IPSSectionsMedicationSummary:
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   "MedicationStatement",
			Where: map[string]interface{}{
				"status": "active,intended,unknown,on-hold",
			},
		})
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   "MedicationRequest",
			Where: map[string]interface{}{
				"status": "active,unknown,on-hold",
			},
		})

	case pkg.IPSSectionsDiagnosticResults:
		lastReportsPerCodeQueries, err := gr.generateLastNResourcesPerCodeQueries(
			ctx,
			models.QueryResource{
				Select: nil,
				From:   "DiagnosticReport",
				Where: map[string]interface{}{
					"category": "LAB",
				},
				Aggregations: &models.QueryResourceAggregations{
					GroupBy: &models.QueryResourceAggregation{Field: "code:code"},
				},
			},
			1,
			[]string{},
		)

		if err != nil {
			return nil, err
		}

		queries = append(queries, lastReportsPerCodeQueries...)

		lastObservationsPerCodeQueries, err := gr.generateLastNResourcesPerCodeQueries(
			ctx,
			models.QueryResource{
				Select: nil,
				From:   "Observation",
				Where: map[string]interface{}{
					"category": "laboratory",
				},
				Aggregations: &models.QueryResourceAggregations{
					GroupBy: &models.QueryResourceAggregation{Field: "code:code"},
				},
			},
			1,
			[]string{},
		)

		if err != nil {
			return nil, err
		}

		queries = append(queries, lastObservationsPerCodeQueries...)

	case pkg.IPSSectionsVitalSigns:
		lastObservationsPerCodeQueries, err := gr.generateLastNResourcesPerCodeQueries(
			ctx,
			models.QueryResource{
				Select: nil,
				From:   "Observation",
				Where: map[string]interface{}{
					"category": "vital-signs",
				},
				Aggregations: &models.QueryResourceAggregations{
					GroupBy: &models.QueryResourceAggregation{Field: "code:code"},
				},
			},
			3,
			[]string{
				"85353-1", "9279-1", "8867-4", "2708-6", "8310-5", "8302-2", "9843-4", "29463-7", "39156-5", "85354-9", "8480-6", "8462-4", "8478-0",
			},
		)

		if err != nil {
			return nil, err
		}

		queries = append(queries, lastObservationsPerCodeQueries...)

	case pkg.IPSSectionsSocialHistory:
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   "Observation",
			Where: map[string]interface{}{
				"category":   "social-history",
				"status:not": "preliminary",
			},
		})

	case pkg.IPSSectionsPregnancy:
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   "Observation",
			Where: map[string]interface{}{
				"status:not": "preliminary",
				"code":       "82810-3", //pregnancy status LOINC code
			},
		})

	case pkg.IPSSectionsImmunizations:
		lastImmunizationsPerCodeQueries, err := gr.generateLastNResourcesPerCodeQueries(
			ctx,
			models.QueryResource{
				Select: nil,
				From:   "Immunization",
				Where: map[string]interface{}{
					"status:not": "entered-in-error",
				},
				Aggregations: &models.QueryResourceAggregations{
					GroupBy: &models.QueryResourceAggregation{Field: "vaccineCode:code"},
				},
			},
			3,
			[]string{},
		)

		if err != nil {
			return nil, err
		}

		queries = append(queries, lastImmunizationsPerCodeQueries...)

	case pkg.IPSSectionsAdvanceDirectives:
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   "Consent",
			Where: map[string]interface{}{
				"status": "active",
			},
		})

	case pkg.IPSSectionsFunctionalStatus:
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   "ClinicalImpression",
			Where: map[string]interface{}{
				"status": "in-progress,completed",
			},
		})

	case pkg.IPSSectionsMedicalDevices:
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   "Device",
			Where: map[string]interface{}{
				"status": "entered-in-error",
			},
		})

	case pkg.IPSSectionsHistoryOfIllness:
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   "Condition",
			Where: map[string]interface{}{
				"clinicalStatus": "inactive,remission,resolved",
			},
		})

	case pkg.IPSSectionsPlanOfCare:
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   "CarePlan",
			Where: map[string]interface{}{
				"status": "active,on-hold,unknown",
			},
		})

	case pkg.IPSSectionsHistoryOfProcedures:
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   "Procedure",
			Where: map[string]interface{}{
				"status:not": []string{"entered-in-error", "not-done"},
			},
		})

	default:
		return nil, fmt.Errorf("unsupported section type: %s", sectionType)
	}

	return queries, nil
}

func (gr *GormRepository) generateLastNResourcesPerCodeQueries(ctx context.Context, groupByQuery models.QueryResource, limit int, initialCodes []string) ([]models.QueryResource, error) {
	queries := []models.QueryResource{}

	resourcesGrouped, err := gr.QueryResources(ctx, groupByQuery)

	if err != nil {
		return nil, err
	}

	resourcesGroupedByCodeList, ok := resourcesGrouped.([]map[string]any)
	if !ok {
		return nil, fmt.Errorf("could not decode resources grouped by code")
	}

	resourcesCodes := initialCodes

	for _, resource := range resourcesGroupedByCodeList {
		//now that we have a list of codes that are tagged as vital-signs.
		if labelValue, labelValueOk := resource["label"]; labelValueOk {
			if labelValueStr, labeValueStrOk := labelValue.(*interface{}); labeValueStrOk {
				resourcesCodes = append(resourcesCodes, (*labelValueStr).(string))
			} else {
				gr.Logger.Warnf("could not cast codes to string")
			}
		} else {
			gr.Logger.Warnf("could not retrieve group-by clause label value")
		}
	}
	resourcesCodes = lo.Uniq(resourcesCodes)

	codeField, _, ok := strings.Cut(groupByQuery.Aggregations.GroupBy.Field, ":")
	if !ok {
		return nil, fmt.Errorf("could not determine code field name")
	}

	//group by code, sort by date, limit to the most recent 3
	for _, code := range resourcesCodes {
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   groupByQuery.From,
			Where: map[string]interface{}{
				codeField: code,
			},
			Limit: &limit,
		})
	}

	return queries, nil
}

// generate header information for Composition Sections. Title & Code for each section
func generateIPSSectionHeaderInfo(sectionType pkg.IPSSections) (string, fhir401.CodeableConcept, error) {
	switch sectionType {
	case pkg.IPSSectionsMedicationSummary:
		return "Medication Summary", fhir401.CodeableConcept{
			Coding: []fhir401.Coding{
				{
					System:  stringPtr("http://loinc.org"),
					Code:    stringPtr("10160-0"),
					Display: stringPtr("Medication Summary"),
				},
			},
		}, nil
	case pkg.IPSSectionsAllergiesIntolerances:
		return "Allergies and Intolerances", fhir401.CodeableConcept{
			Coding: []fhir401.Coding{
				{
					System:  stringPtr("http://loinc.org"),
					Code:    stringPtr("48765-2"),
					Display: stringPtr("Allergies and Intolerances"),
				},
			},
		}, nil
	case pkg.IPSSectionsProblemList:
		return "Problem List", fhir401.CodeableConcept{
			Coding: []fhir401.Coding{
				{
					System:  stringPtr("http://loinc.org"),
					Code:    stringPtr("11450-4"),
					Display: stringPtr("Problem List"),
				},
			},
		}, nil
	case pkg.IPSSectionsImmunizations:
		return "Immunizations", fhir401.CodeableConcept{
			Coding: []fhir401.Coding{
				{
					System:  stringPtr("http://loinc.org"),
					Code:    stringPtr("11369-6"),
					Display: stringPtr("Immunizations"),
				},
			},
		}, nil
	case pkg.IPSSectionsHistoryOfProcedures:
		return "History of Procedures", fhir401.CodeableConcept{
			Coding: []fhir401.Coding{
				{
					System:  stringPtr("http://loinc.org"),
					Code:    stringPtr("47519-4"),
					Display: stringPtr("History of Procedures"),
				},
			},
		}, nil
	case pkg.IPSSectionsMedicalDevices:
		return "Medical Devices", fhir401.CodeableConcept{
			Coding: []fhir401.Coding{
				{
					System:  stringPtr("http://loinc.org"),
					Code:    stringPtr("46264-8"),
					Display: stringPtr("Medical Devices"),
				},
			},
		}, nil
	case pkg.IPSSectionsDiagnosticResults:
		return "Diagnostic Results", fhir401.CodeableConcept{
			Coding: []fhir401.Coding{
				{
					System:  stringPtr("http://loinc.org"),
					Code:    stringPtr("30954-2"),
					Display: stringPtr("Diagnostic Results"),
				},
			},
		}, nil
	case pkg.IPSSectionsVitalSigns:
		return "Vital Signs", fhir401.CodeableConcept{
			Coding: []fhir401.Coding{
				{
					System:  stringPtr("http://loinc.org"),
					Code:    stringPtr("8716-3"),
					Display: stringPtr("Vital Signs"),
				},
			},
		}, nil
	case pkg.IPSSectionsHistoryOfIllness:
		return "Past History of Illness", fhir401.CodeableConcept{
			Coding: []fhir401.Coding{
				{
					System:  stringPtr("http://loinc.org"),
					Code:    stringPtr("11348-0"),
					Display: stringPtr("History of Illness"),
				},
			},
		}, nil
	case pkg.IPSSectionsPregnancy:
		return "Pregnancy History", fhir401.CodeableConcept{
			Coding: []fhir401.Coding{
				{
					System:  stringPtr("http://loinc.org"),
					Code:    stringPtr("10162-6"),
					Display: stringPtr("Pregnancy History"),
				},
			},
		}, nil
	case pkg.IPSSectionsSocialHistory:
		return "Social History", fhir401.CodeableConcept{
			Coding: []fhir401.Coding{
				{
					System:  stringPtr("http://loinc.org"),
					Code:    stringPtr("29762-2"),
					Display: stringPtr("Social History"),
				},
			},
		}, nil
	case pkg.IPSSectionsPlanOfCare:
		return "Plan of Care", fhir401.CodeableConcept{
			Coding: []fhir401.Coding{
				{
					System:  stringPtr("http://loinc.org"),
					Code:    stringPtr("18776-5"),
					Display: stringPtr("Plan of Care"),
				},
			},
		}, nil
	case pkg.IPSSectionsFunctionalStatus:
		return "Functional Status", fhir401.CodeableConcept{
			Coding: []fhir401.Coding{
				{
					System:  stringPtr("http://loinc.org"),
					Code:    stringPtr("47420-5"),
					Display: stringPtr("Functional Status"),
				},
			},
		}, nil
	case pkg.IPSSectionsAdvanceDirectives:
		return "Advance Directives", fhir401.CodeableConcept{
			Coding: []fhir401.Coding{
				{
					System:  stringPtr("http://loinc.org"),
					Code:    stringPtr("42348-3"),
					Display: stringPtr("Advance Directives"),
				},
			},
		}, nil
	default:
		return "", fhir401.CodeableConcept{}, fmt.Errorf("invalid section type: %s", sectionType)
	}

}

// When given a list of Patient database records, we need to merge them together to a Patient record that's usable by the export
func (gr *GormRepository) GetPatientMerged(ctx context.Context) (*database.FhirPatient, error) {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	tableName, err := database.GetTableNameByResourceType("Patient")
	if err != nil {
		return nil, err
	}

	var wrappedFhirPatients []database.FhirPatient
	results := gr.GormClient.WithContext(ctx).
		//Group("source_id"). //broken in Postgres.
		Where(models.OriginBase{
			UserID:             currentUser.ID,
			SourceResourceType: "Patient",
		}).
		Order("sort_date DESC").
		Table(tableName).
		Find(&wrappedFhirPatients)

	if results.Error != nil {
		return nil, results.Error
	}

	return mergePatients(wrappedFhirPatients)
}

// helper utility
func stringPtr(s string) *string {
	return &s
}

func mergePatients(patients []database.FhirPatient) (*database.FhirPatient, error) {
	if len(patients) == 0 {
		log.Printf("no patients to merge, ignoring")
		return nil, fmt.Errorf("no patients to merge, ignoring")
	}
	mergedPatientResource := `{}`
	for _, patient := range patients {
		mergedPatientResourceBytes, err := deepmerge.JSON(
			[]byte(mergedPatientResource),
			[]byte(patient.ResourceRaw),
			deepmerge.Config{PreventMultipleDefinitionsOfKeysWithPrimitiveValue: false},
		)
		if err != nil {
			return nil, err
		}
		mergedPatientResource = string(mergedPatientResourceBytes)
	}

	mergedPatient := &database.FhirPatient{
		ResourceBase: models.ResourceBase{
			OriginBase: patients[len(patients)-1].OriginBase,
		},
	}
	err := mergedPatient.PopulateAndExtractSearchParameters([]byte(mergedPatientResource))
	if err != nil {
		return nil, fmt.Errorf("error occurred while extracting fields from merged Patient")
	}
	return mergedPatient, nil
}
