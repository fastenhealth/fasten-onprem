package athena

import (
	"context"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/database"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/hub/internal/fhir/base"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/sirupsen/logrus"
	"net/http"
)

type AthenaClient struct {
	*base.FHIR401Client
}

func NewClient(ctx context.Context, appConfig config.Interface, globalLogger logrus.FieldLogger, source models.Source, testHttpClient ...*http.Client) (base.Client, *models.Source, error) {
	baseClient, updatedSource, err := base.NewFHIR401Client(ctx, appConfig, globalLogger, source, testHttpClient...)
	return AthenaClient{
		baseClient,
	}, updatedSource, err
}

func (c AthenaClient) SyncAll(db database.DatabaseRepository) error {
	supportedResources := []string{
		"AllergyIntolerance",
		//"Binary",
		"CarePlan",
		"CareTeam",
		"Condition",
		"Device",
		"DiagnosticReport",
		"DocumentReference",
		"Encounter",
		"Goal",
		"Immunization",
		//"Location",
		//"Medication",
		//"MedicationRequest",
		"Observation",
		//"Organization",
		//"Patient",
		//"Practitioner",
		"Procedure",
		//"Provenance",
	}

	return c.SyncAllByResourceName(db, supportedResources)
}
