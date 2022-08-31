package cigna

import (
	"context"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/database"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/hub/internal/fhir/base"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/fastenhealth/gofhir-models/fhir401"
	fhirutils "github.com/fastenhealth/gofhir-models/fhir401/utils"
	"github.com/sirupsen/logrus"
	"net/http"
)

type CignaClient struct {
	*base.FHIR401Client
}

func NewClient(appConfig config.Interface, globalLogger logrus.FieldLogger, source models.Source, testHttpClient ...*http.Client) (base.Client, error) {
	baseClient, err := base.NewFHIR401Client(appConfig, globalLogger, source, testHttpClient...)
	return CignaClient{
		baseClient,
	}, err
}

func (c CignaClient) SyncAll(db database.DatabaseRepository) error {

	bundle, err := c.GetPatientEverything(c.Source.PatientId)
	if err != nil {
		return err
	}

	resources := []interface{}{}
	for _, bundleEntry := range bundle.Entry {
		resource, _ := fhirutils.MapToResource(bundleEntry.Resource, false)
		resources = append(resources, resource)
	}

	patientResources := []fhir401.Patient{}
	for _, resource := range resources {
		if patient, isPatient := resource.(fhir401.Patient); isPatient {
			patientResources = append(patientResources, patient)
		}
	}

	c.Logger.Infof("patients lenght: %v", len(patientResources))
	patientProfiles, err := c.ProcessPatients(patientResources)

	//patientProfile. = c.Source.ID
	c.Logger.Infof("CREATING PATIENT PROFILES: %v", patientProfiles)
	for _, patient := range patientProfiles {
		err = db.UpsertSourceResource(context.Background(), patient)
		if err != nil {
			return err
		}
	}

	return nil
}
