package database

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/fastenhealth/gofhir-models/fhir401"
	"github.com/google/uuid"
	"log"
	"time"
)

func (gr *GormRepository) GetInternationalPatientSummaryBundle(ctx context.Context) (interface{}, error) {
	summaryTime := time.Now()
	timestamp := summaryTime.Format(time.RFC3339)

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
	summarySectionResources, err := gr.GetInternationalPatientSummarySectionResources(ctx)
	if err != nil {
		return nil, err
	}

	//Step 2. Create the Composition Section
	compositionSections := []fhir401.CompositionSection{}
	for sectionType, sectionResources := range summarySectionResources {
		compositionSection, err := generateIPSCompositionSection(sectionType, sectionResources)
		if err != nil {
			return nil, err
		}
		compositionSections = append(compositionSections, *compositionSection)
	}

	//TODO: Step 3. Query all the Patient Resources & merge them together

	//TODO: Step 4. Create a Fasten Health Organization resource.

	compositionUUID := uuid.New().String()

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
			Reference: stringPtr("Patient/123"), //TODO
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
					Reference: stringPtr("Patient/123"),
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
		return nil, err
	}
	ipsBundle.Entry = append(ipsBundle.Entry, fhir401.BundleEntry{
		Resource: json.RawMessage(ipsCompositionJson),
	})

	// TODO: Add the Patient to the bundle
	// TODO: Add the Fasten Health Organization to the bundle

	// Add all the resources to the bundle
	for _, sectionResources := range summarySectionResources {
		for _, resource := range sectionResources {
			ipsBundle.Entry = append(ipsBundle.Entry, fhir401.BundleEntry{
				Resource: json.RawMessage(resource.ResourceRaw),
			})
		}
	}

	return ipsBundle, nil
}

// GetInternationalPatientSummary will generate an IPS bundle, which can then be used to generate a IPS QR code, PDF or JSON bundle
// The IPS bundle will contain a summary of all the data in the system, including a list of all sources, and the main Patient
// See: https://github.com/fastenhealth/fasten-onprem/issues/170
// See: https://github.com/jddamore/fhir-ips-server/blob/main/docs/Summary_Creation_Steps.md
func (gr *GormRepository) GetInternationalPatientSummarySectionResources(ctx context.Context) (map[pkg.IPSSections][]models.ResourceBase, error) {

	summarySectionResources := map[pkg.IPSSections][]models.ResourceBase{}

	// generate queries for each IPS Section
	for ndx, _ := range pkg.IPSSectionsList {
		sectionName := pkg.IPSSectionsList[ndx]

		//initialize the section
		summarySectionResources[sectionName] = []models.ResourceBase{}

		queries, err := generateIPSSectionQueries(sectionName)
		if err != nil {
			return nil, err
		}

		for qndx, _ := range queries {
			results, err := gr.QueryResources(ctx, queries[qndx])
			if err != nil {
				return nil, err
			}

			resultsList := results.([]models.ResourceBase)

			//TODO: generate resource narrative
			summarySectionResources[sectionName] = append(summarySectionResources[sectionName], resultsList...)
		}
	}

	return summarySectionResources, nil
}

func generateIPSCompositionSection(sectionType pkg.IPSSections, resources []models.ResourceBase) (*fhir401.CompositionSection, error) {
	sectionTitle, sectionCode, err := generateIPSSectionHeaderInfo(sectionType)
	if err != nil {
		return nil, err
	}

	section := &fhir401.CompositionSection{
		Title: &sectionTitle,
		Code:  &sectionCode,
	}
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
				Reference: stringPtr(fmt.Sprintf("%s/%s", resource.SourceResourceType, resource.SourceID)),
			}
			if err != nil {
				return nil, err
			}
			section.Entry = append(section.Entry, reference)
		}

		//TODO: Add the section narrative summary
		section.Text = &fhir401.Narrative{
			Status: fhir401.NarrativeStatusGenerated,
			Div:    "PLACEHOLDER NARRATIVE SUMMARY FOR SECTION",
		}

	}
	return section, nil
}

// https://github.com/jddamore/fhir-ips-server/blob/main/docs/Summary_Creation_Steps.md
// Generate Resource Queries for each IPS Section
func generateIPSSectionQueries(sectionType pkg.IPSSections) ([]models.QueryResource, error) {

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
		//TODO: group by code, sort by date, limit to the most recent 3
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   "Observation",
			Where: map[string]interface{}{
				"category": "vital-signs",
			},
		})
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

func generateIPSSectionNarrative(sectionType pkg.IPSSections, resources []models.ResourceBase) string {
	return ""
}

// helper utility
func stringPtr(s string) *string {
	return &s
}
