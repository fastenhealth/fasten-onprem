package database

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/TwiN/deepmerge"
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/utils/ips"
	"github.com/fastenhealth/gofhir-models/fhir401"
	"github.com/google/uuid"
	"github.com/samber/lo"
	"log"
	"time"
)

// returns IPSBundle and IPSComposition
func (gr *GormRepository) GetInternationalPatientSummaryExport(ctx context.Context) (*ips.InternationalPatientSummaryExportData, error) {
	exportData := &ips.InternationalPatientSummaryExportData{}

	summaryTime := time.Now()
	timestamp := summaryTime.Format(time.RFC3339)

	exportData.GenerationDate = summaryTime

	//get a list of all Patients associated with this user (we'll be creating a pseudo Patient for referencing in this Bundle
	patient, err := gr.GetPatientMerged(ctx)
	if err != nil {
		//TODO: determine if we should error out here. If only manually entered records were entered, we wont have a Patient record,
		return exportData, err
	}
	exportData.Patient = patient

	//get a list of all Sources associated with this user
	sources, err := gr.GetSources(ctx)
	if err != nil {
		return exportData, err
	}
	exportData.Sources = sources

	narrativeEngine, err := ips.NewNarrative()
	if err != nil {
		return exportData, fmt.Errorf("error creating narrative engine: %w", err)
	}

	//Algorithm to create the IPS bundle
	// 1. Generate the IPS Section Lists (GetInternationalPatientSummarySectionResources)
	// 		- Process each resource, generating a Markdown narrative in the text field for each resource
	//      - keep track of the earliest and latest date of the resources in the section
	// 2. Create the Composition Section (generateIPSCompositionSection)
	//      - Populate it with the data from the Header
	//      - Generate a Section Narrative, written in Markdown, which summarizes the contents of the section at a high level, with dates and counts
	// 3. Query all the Patient Resources
	// 		- Merge the Patient resources together?
	// 4. Create a Fasten Health Organization resource. This is the custodian of the IPS
	// 5. Create the IPS Composition
	//      - Populate it with the Composition Sections and references to the Patient resource + Fasten Health Organziation resource
	//      - Generate a Composition Narrative, written in Markdown, which summarizes the contents of the IPS & Patient at a high level, with dates and counts
	// 6. Create the IPS Bundle

	//Step 1. Generate the IPS Section Lists
	summarySectionQueryResults, err := gr.getInternationalPatientSummarySectionResources(ctx)
	if err != nil {
		return exportData, err
	}

	//Step 2. Create the Composition Section
	compositionSections := []fhir401.CompositionSection{}

	//loop though the various section groups in order (required, recommended, optional)
	for ndx, _ := range pkg.IPSSectionGroupsOrdered[pkg.IPSSectionGroupsRequired] {
		section := pkg.IPSSectionGroupsOrdered[pkg.IPSSectionGroupsRequired][ndx]
		if sectionQueryResultsList, ok := summarySectionQueryResults[section]; ok {
			compositionSection, err := generateIPSCompositionSection(narrativeEngine, section, sectionQueryResultsList)
			if err != nil {
				return exportData, err
			}
			compositionSections = append(compositionSections, *compositionSection)
		}
	}
	for ndx, _ := range pkg.IPSSectionGroupsOrdered[pkg.IPSSectionGroupsRecommended] {
		section := pkg.IPSSectionGroupsOrdered[pkg.IPSSectionGroupsRecommended][ndx]
		if sectionQueryResultsList, ok := summarySectionQueryResults[section]; ok {
			compositionSection, err := generateIPSCompositionSection(narrativeEngine, section, sectionQueryResultsList)
			if err != nil {
				return exportData, err
			}
			compositionSections = append(compositionSections, *compositionSection)
		}
	}
	for ndx, _ := range pkg.IPSSectionGroupsOrdered[pkg.IPSSectionGroupsOptional] {
		section := pkg.IPSSectionGroupsOrdered[pkg.IPSSectionGroupsOptional][ndx]
		if sectionQueryResultsList, ok := summarySectionQueryResults[section]; ok {
			compositionSection, err := generateIPSCompositionSection(narrativeEngine, section, sectionQueryResultsList)
			if err != nil {
				return exportData, err
			}
			compositionSections = append(compositionSections, *compositionSection)
		}
	}

	//for sectionType, sectionQueryResultsList := range summarySectionQueryResults {
	//	compositionSection, err := generateIPSCompositionSection(narrativeEngine, sectionType, sectionQueryResultsList)
	//	if err != nil {
	//		return exportData, err
	//	}
	//	compositionSections = append(compositionSections, *compositionSection)
	//}

	//TODO: Step 3. Query all the Patient Resources & merge them together

	//TODO: Step 4. Create a Fasten Health Organization resource.

	compositionUUID := uuid.New().String()
	patientReference := fmt.Sprintf("%s/%s", exportData.Patient.GetSourceResourceType(), exportData.Patient.GetSourceResourceID())

	//Step 5. Create the IPS Composition
	ipsComposition := &fhir401.Composition{
		Id: stringPtr(compositionUUID),
		Text: &fhir401.Narrative{
			Status: fhir401.NarrativeStatusGenerated,
			Div:    "PLACEHOLDER NARRATIVE SUMMARY FOR COMPOSITION", //TODO
		},
		Identifier: &fhir401.Identifier{
			System: stringPtr("https://www.fastenhealth.com"), //TODO
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
			Reference: stringPtr(patientReference), //TODO
		},
		Date: timestamp,
		Author: []fhir401.Reference{
			{
				Reference: stringPtr("Organization/fastenhealth.com"), //TODO: The type of author(s) contribute to determine the "nature"of the Patient Summary: e.g. a "human-curated" IPS Vs. an "automatically generated" IPS.
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
					Start: &timestamp, //TODO: this should be the oldest record in the summary
					End:   &timestamp,
				},
			},
		},
	}
	ipsComposition.Section = compositionSections

	// Step 6. Create the IPS Bundle
	bundleUUID := uuid.New().String()
	ipsBundle := &fhir401.Bundle{
		Id:        &bundleUUID,
		Timestamp: &timestamp,
		Language:  stringPtr("en-US"),
		Entry:     []fhir401.BundleEntry{},
		Type:      fhir401.BundleTypeDocument,
	}

	// Add the Composition to the bundle
	ipsCompositionJson, err := json.Marshal(ipsComposition)
	if err != nil {
		return exportData, err
	}
	ipsBundle.Entry = append(ipsBundle.Entry, fhir401.BundleEntry{
		Resource: json.RawMessage(ipsCompositionJson),
	})

	// TODO: Add the Patient to the bundle
	// TODO: Add the Fasten Health Organization to the bundle

	// TODO: Add all the resources to the bundle
	//for _, sectionResources := range summarySectionResources {
	//	for _, resource := range sectionResources {
	//		ipsBundle.Entry = append(ipsBundle.Entry, fhir401.BundleEntry{
	//			Resource: json.RawMessage(resource.GetResourceRaw()),
	//		})
	//	}
	//}

	exportData.Bundle = ipsBundle
	exportData.Composition = ipsComposition

	return exportData, nil
}

// GetInternationalPatientSummary will generate an IPS bundle, which can then be used to generate a IPS QR code, PDF or JSON bundle
// The IPS bundle will contain a summary of all the data in the system, including a list of all sources, and the main Patient
// See: https://github.com/fastenhealth/fasten-onprem/issues/170
// See: https://github.com/jddamore/fhir-ips-server/blob/main/docs/Summary_Creation_Steps.md
func (gr *GormRepository) getInternationalPatientSummarySectionResources(ctx context.Context) (map[pkg.IPSSections][]any, error) {

	summarySectionResources := map[pkg.IPSSections][]any{}

	// generate queries for each IPS Section
	for ndx, _ := range pkg.IPSSectionsList {
		sectionName := pkg.IPSSectionsList[ndx]

		//initialize the section
		summarySectionResources[sectionName] = []any{}

		queries, err := gr.generateIPSSectionQueries(ctx, sectionName)
		if err != nil {
			return nil, err
		}

		for qndx, _ := range queries {
			results, err := gr.QueryResources(ctx, queries[qndx])
			if err != nil {
				return nil, err
			}

			//resultsList := convertUnknownInterfaceToFhirSlice(results)

			//TODO: generate resource narrative
			summarySectionResources[sectionName] = append(summarySectionResources[sectionName], results)
		}
	}

	return summarySectionResources, nil
}

func generateIPSCompositionSection(narrativeEngine *ips.Narrative, sectionType pkg.IPSSections, queryResultsList []any) (*fhir401.CompositionSection, error) {
	sectionTitle, sectionCode, err := generateIPSSectionHeaderInfo(sectionType)
	if err != nil {
		return nil, err
	}

	section := &fhir401.CompositionSection{
		Title: &sectionTitle,
		Code:  &sectionCode,
	}

	//database.IFhirResourceModel

	resources := flattenQueryResultsToResourcesList(queryResultsList)

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
			if err != nil {
				return nil, err
			}
			section.Entry = append(section.Entry, reference)
		}

		//TODO: Add the section narrative summary
		rendered, err := narrativeEngine.RenderSection(
			sectionType,
			resources,
		)
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
		break
	case pkg.IPSSectionsProblemList:
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   "Condition",
			Where: map[string]interface{}{
				"clinicalStatus:not":     []string{"inactive", "resolved"},
				"verificationStatus:not": []string{"entered-in-error"},
			},
		})
		break
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
		break
	case pkg.IPSSectionsDiagnosticResults:
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   "DiagnosticReport",
			Where: map[string]interface{}{
				"category": "LAB",
			},
		})

		//TODO: group by code, sort by date, limit to the most recent 3
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   "Observation",
			Where: map[string]interface{}{
				"category":   "laboratory",
				"status:not": "preliminary",
			},
		})
		break
	case pkg.IPSSectionsVitalSigns:
		//lets query the database for this user, getting a list of unique codes, associated with this category ('vital-signs').
		//our goal is to retrieve the 3 most recent values for each code.
		vitalSignsGrouped, err := gr.QueryResources(ctx, models.QueryResource{
			Select: nil,
			From:   "Observation",
			Where: map[string]interface{}{
				"category": "vital-signs",
			},
			Aggregations: &models.QueryResourceAggregations{
				GroupBy: &models.QueryResourceAggregation{Field: "code:code"},
			},
		})

		if err != nil {
			return nil, err
		}

		vitalSignsGroupedByCodeList, ok := vitalSignsGrouped.([]map[string]any)
		if !ok {
			return nil, fmt.Errorf("could not decode vital signs grouped by code")
		}

		//known codes related to vital signs: https://www.hl7.org/fhir/R4/valueset-observation-vitalsignresult.html#definition
		vitalSignCodes := []string{
			"85353-1", "9279-1", "8867-4", "2708-6", "8310-5", "8302-2", "9843-4", "29463-7", "39156-5", "85354-9", "8480-6", "8462-4", "8478-0",
		}

		for ndx, _ := range vitalSignsGroupedByCodeList {
			//now that we have a list of codes that are tagged as vital-signs.
			if labelValue, labelValueOk := vitalSignsGroupedByCodeList[ndx]["label"]; labelValueOk {
				if labelValueStr, labeValueStrOk := labelValue.(*interface{}); labeValueStrOk {
					vitalSignCodes = append(vitalSignCodes, (*labelValueStr).(string))
				} else {
					gr.Logger.Warnf("could not cast vital-sign codes to string")
				}
			} else {
				gr.Logger.Warnf("could not retrieve vital-sign group-by clause label value")
			}
		}
		vitalSignCodes = lo.Uniq(vitalSignCodes)

		limit := 3
		//group by code, sort by date, limit to the most recent 3
		for ndx, _ := range vitalSignCodes {
			queries = append(queries, models.QueryResource{
				Select: nil,
				From:   "Observation",
				Where: map[string]interface{}{
					"code": vitalSignCodes[ndx],
				},
				Limit: &limit,
			})
		}
		break
	case pkg.IPSSectionsSocialHistory:
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   "Observation",
			Where: map[string]interface{}{
				"category":   "social-history",
				"status:not": "preliminary",
			},
		})
		break
	case pkg.IPSSectionsPregnancy:
		//TODO: determine the code for pregnancy from IPS specification
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   "Observation",
			Where: map[string]interface{}{
				"status:not": "preliminary",
			},
		})
		break
	case pkg.IPSSectionsImmunizations:
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   "Immunization",
			Where: map[string]interface{}{
				"status:not": "entered-in-error",
			},
		})
		break
	case pkg.IPSSectionsAdvanceDirectives:
		//queries = append(queries, models.QueryResource{
		//	Select: nil,
		//	From:   "Consent",
		//	Where: map[string]interface{}{
		//		"status": "active",
		//	},
		//})
		log.Printf("warning: Consent FHIR resources are not supported yet. Skipping")
		break
	case pkg.IPSSectionsFunctionalStatus:
		//queries = append(queries, models.QueryResource{
		//	Select: nil,
		//	From:   "ClinicalImpression",
		//	Where: map[string]interface{}{
		//		"status": "in-progress,completed",
		//	},
		//})
		log.Printf("warning: ClinicalImpression FHIR resources are not supported yet. Skipping")
		break
	case pkg.IPSSectionsMedicalDevices:
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   "Device",
			Where: map[string]interface{}{
				"status": "entered-in-error",
			},
		})
		break
	case pkg.IPSSectionsHistoryOfIllness:
		//TODO: last updated date should be older than 5 years (dateTime or period.high)
		//TODO: check if where clause with multiple modifiers for the same field works as expected
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   "Condition",
			Where: map[string]interface{}{
				"clinicalStatus:not": []string{"entered-in-error"},
				"clinicalStatus":     "inactive,remission,resolved",
			},
		})
		break
	case pkg.IPSSectionsPlanOfCare:
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   "CarePlan",
			Where: map[string]interface{}{
				"status": "active,on-hold,unknown",
			},
		})
		break
	case pkg.IPSSectionsHistoryOfProcedures:
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   "Procedure",
			Where: map[string]interface{}{
				"status:not": []string{"entered-in-error", "not-done"},
			},
		})
		break
	default:
		return nil, fmt.Errorf("unsupported section type: %s", sectionType)
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

// QueryResources returns an interface{} which is actually a slice of the appropriate FHIR resource type
// we use this function to "cast" the results to a slice of the IFhirResourceModel interface (so we can use the same code to handle the results)
// TODO: there has to be a better way to do this :/
func convertUnknownInterfaceToFhirSlice(unknown interface{}) []database.IFhirResourceModel {
	results := []database.IFhirResourceModel{}

	switch fhirSlice := unknown.(type) {
	case []database.FhirAllergyIntolerance:
		for ndx, _ := range fhirSlice {
			results = append(results, &fhirSlice[ndx])
		}
	case []database.FhirCarePlan:
		for ndx, _ := range fhirSlice {
			results = append(results, &fhirSlice[ndx])
		}
	case []database.FhirCondition:
		for ndx, _ := range fhirSlice {
			results = append(results, &fhirSlice[ndx])
		}
	case []database.FhirDevice:
		for ndx, _ := range fhirSlice {
			results = append(results, &fhirSlice[ndx])
		}
	case []database.FhirDiagnosticReport:
		for ndx, _ := range fhirSlice {
			results = append(results, &fhirSlice[ndx])
		}
	case []database.FhirEncounter:
		for ndx, _ := range fhirSlice {
			results = append(results, &fhirSlice[ndx])
		}
	case []database.FhirImmunization:
		for ndx, _ := range fhirSlice {
			results = append(results, &fhirSlice[ndx])
		}
	case []database.FhirMedicationRequest:
		for ndx, _ := range fhirSlice {
			results = append(results, &fhirSlice[ndx])
		}
	case []database.FhirMedicationStatement:
		for ndx, _ := range fhirSlice {
			results = append(results, &fhirSlice[ndx])
		}
	case []database.FhirObservation:
		for ndx, _ := range fhirSlice {
			results = append(results, &fhirSlice[ndx])
		}
	case []database.FhirPatient:
		for ndx, _ := range fhirSlice {
			results = append(results, &fhirSlice[ndx])
		}
	case []database.FhirProcedure:
		for ndx, _ := range fhirSlice {
			results = append(results, &fhirSlice[ndx])
		}
	default:
		log.Panicf("could not detect type for query results fhir resource list: %v", fhirSlice)
	}

	return results
}

// query results may be a list of database.IFhirResourceModel or a map[string][]database.IFhirResourceModel (if we're using aggregations/grouping)
func flattenQueryResultsToResourcesList(queryResultsList []any) []database.IFhirResourceModel {
	resources := []database.IFhirResourceModel{}

	for ndx, _ := range queryResultsList {
		queryResults := queryResultsList[ndx]
		switch queryResultsTyped := queryResults.(type) {
		case []map[string]any:
			//aggregated resources
			for andx, _ := range queryResultsTyped {
				queryResultsGrouped := queryResultsTyped[andx]
				resources = append(resources, convertUnknownInterfaceToFhirSlice(queryResultsGrouped)...)
			}

		case interface{}:
			//list of resources
			resources = append(resources, convertUnknownInterfaceToFhirSlice(queryResultsTyped)...)
		default:
			log.Panicf("Unknown Resource Structure: %v", queryResultsTyped)
		}
	}

	return resources
}

// When given a list of Patient database records, we need to merge them together to a Patient record that's usable by the
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
	for ndx, _ := range patients {
		patient := patients[ndx]
		mergedPatientResourceBytes, err := deepmerge.JSON([]byte(mergedPatientResource), []byte(patient.ResourceRaw))
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
