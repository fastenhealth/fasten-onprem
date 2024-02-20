package database

import (
	"context"
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	databaseModel "github.com/fastenhealth/fasten-onprem/backend/pkg/models/database"
)

// GetInternationalPatientSummary will generate an IPS bundle, which can then be used to generate a IPS QR code, PDF or JSON bundle
// The IPS bundle will contain a summary of all the data in the system, including a list of all sources, and the main Patient
// See: https://github.com/fastenhealth/fasten-onprem/issues/170
// See: https://github.com/jddamore/fhir-ips-server/blob/main/docs/Summary_Creation_Steps.md
func (gr *GormRepository) GetInternationalPatientSummary(ctx context.Context) (*models.Summary, error) {
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	// we want a count of all resources for this user by type
	var resourceCountResults []map[string]interface{}

	resourceTypes := databaseModel.GetAllowedResourceTypes()
	for _, resourceType := range resourceTypes {
		tableName, err := databaseModel.GetTableNameByResourceType(resourceType)
		if err != nil {
			return nil, err
		}
		var count int64

		gr.QueryResources(ctx, models.QueryResource{
			Use:          "",
			Select:       nil,
			From:         "",
			Where:        nil,
			Limit:        nil,
			Offset:       nil,
			Aggregations: nil,
		})

		result := gr.GormClient.WithContext(ctx).
			Table(tableName).
			Where(models.OriginBase{
				UserID: currentUser.ID,
			}).
			Count(&count)
		if result.Error != nil {
			return nil, result.Error
		}
		if count == 0 {
			continue //don't add resource counts if the count is 0
		}
		resourceCountResults = append(resourceCountResults, map[string]interface{}{
			"resource_type": resourceType,
			"count":         count,
		})
	}

	// we want a list of all sources (when they were last updated)
	sources, err := gr.GetSources(ctx)
	if err != nil {
		return nil, err
	}

	// we want the main Patient for each source
	patients, err := gr.GetPatientForSources(ctx)
	if err != nil {
		return nil, err
	}

	if resourceCountResults == nil {
		resourceCountResults = []map[string]interface{}{}
	}
	summary := &models.Summary{
		Sources:            sources,
		ResourceTypeCounts: resourceCountResults,
		Patients:           patients,
	}

	return summary, nil
}

// https://github.com/jddamore/fhir-ips-server/blob/main/docs/Summary_Creation_Steps.md
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
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   "Consent",
			Where: map[string]interface{}{
				"status": "active",
			},
		})
		break
	case pkg.IPSSectionsFunctionalStatus:
		queries = append(queries, models.QueryResource{
			Select: nil,
			From:   "ClinicalImpression",
			Where: map[string]interface{}{
				"status": "in-progress,completed",
			},
		})
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
	case pkg.IPSSectionsHistoryOfIllnesses:
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
	}

	return queries, nil
}
