package cigna

import (
	"context"
	"fmt"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/database"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/hub/internal/fhir/base"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/fastenhealth/gofhir-models/fhir401"
	fhirutils "github.com/fastenhealth/gofhir-models/fhir401/utils"
	"github.com/google/uuid"
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

	resourceRefLookup := map[string]uuid.UUID{}

	//////////////////////////////////////////////////////////////////////
	// Patient
	//////////////////////////////////////////////////////////////////////
	patientResources := []fhir401.Patient{}
	for _, resource := range resources {
		if patient, isPatient := resource.(fhir401.Patient); isPatient {
			patientResources = append(patientResources, patient)
		}
	}
	apiProfiles, err := c.ProcessPatients(patientResources)
	for _, profile := range apiProfiles {
		err = db.UpsertProfile(context.Background(), &profile)
		if err != nil {
			return err
		}
		//add upserted resource uuids to lookup
		resourceRefLookup[fmt.Sprintf("%s/%s", profile.SourceResourceType, profile.SourceResourceID)] = profile.ID
	}

	//////////////////////////////////////////////////////////////////////
	// Organization
	//////////////////////////////////////////////////////////////////////

	organizations := []fhir401.Organization{}
	for _, resource := range resources {
		if org, isOrganization := resource.(fhir401.Organization); isOrganization {
			organizations = append(organizations, org)
		}
	}
	apiOrgs, err := c.ProcessOrganizations(organizations)
	for _, apiOrg := range apiOrgs {
		err = db.UpsertOrganziation(context.Background(), &apiOrg)
		if err != nil {
			return err
		}
		//add upserted resource uuids to lookup
		resourceRefLookup[fmt.Sprintf("%s/%s", apiOrg.SourceResourceType, apiOrg.SourceResourceID)] = apiOrg.ID
	}

	return nil
}
