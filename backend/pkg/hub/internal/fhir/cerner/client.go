package cerner

import (
	"context"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/database"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/hub/internal/fhir/base"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/sirupsen/logrus"
	"net/http"
)

type CernerClient struct {
	*base.FHIR401Client
}

func NewClient(ctx context.Context, appConfig config.Interface, globalLogger logrus.FieldLogger, source models.Source, testHttpClient ...*http.Client) (base.Client, *models.Source, error) {
	baseClient, updatedSource, err := base.NewFHIR401Client(ctx, appConfig, globalLogger, source, testHttpClient...)
	baseClient.Headers["Accept"] = "application/json+fhir"
	return CernerClient{
		baseClient,
	}, updatedSource, err
}

func (c CernerClient) SyncAll(db database.DatabaseRepository) error {

	supportedResources := []string{
		"AllergyIntolerance",
		"CarePlan",
		"CareTeam",
		"Condition",
		"Consent",
		"Device",
		"Encounter",
		"FamilyMemberHistory",
		"Goal",
		"Immunization",
		"InsurancePlan",
		"MedicationRequest",
		"NutritionOrder",
		"Observation",
		"Person",
		"Procedure",
		"Provenance",
		"Questionnaire",
		"QuestionnaireResponse",
		"RelatedPerson",
		"Schedule",
		"ServiceRequest",
		"Slot",
	}
	return c.SyncAllByResourceName(db, supportedResources)
}
