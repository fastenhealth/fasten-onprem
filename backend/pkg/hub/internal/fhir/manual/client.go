package manual

import (
	"context"
	"fmt"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/database"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/hub/internal/fhir/base"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/fastenhealth/gofhir-models/fhir401"
	fhir401utils "github.com/fastenhealth/gofhir-models/fhir401/utils"
	"github.com/fastenhealth/gofhir-models/fhir430"
	fhir430utils "github.com/fastenhealth/gofhir-models/fhir430/utils"
	"github.com/samber/lo"
	"github.com/sirupsen/logrus"
	"io"
	"net/http"
	"os"
	"strings"
)

type ManualClient struct {
	Context   context.Context
	AppConfig config.Interface
	Logger    logrus.FieldLogger

	Source *models.Source
}

func (m ManualClient) GetRequest(resourceSubpath string, decodeModelPtr interface{}) error {
	panic("implement me")
}

func (m ManualClient) SyncAll(db database.DatabaseRepository) error {
	panic("implement me")
}

func (m ManualClient) SyncAllBundle(db database.DatabaseRepository, bundleFile *os.File) error {

	// we need to find the (most populated) patient record
	patientId, bundleType, err := m.ExtractPatientId(bundleFile)
	if err != nil {
		return fmt.Errorf("an error occurred while extracting patient id from bundle: %w", err)
	}
	// we need to add the patient id to the source
	m.Source.PatientId = patientId

	// we need to upsert Source
	err = db.CreateSource(m.Context, m.Source)
	if err != nil {
		return fmt.Errorf("an error occurred while creating manual source: %w", err)
	}
	// we need to parse the bundle into resources (might need to try a couple of different times)
	var resourceFhirList []models.ResourceFhir
	switch bundleType {
	case "fhir430":
		bundle430Data := fhir430.Bundle{}
		err := base.ParseBundle(bundleFile, &bundle430Data)
		if err != nil {
			return fmt.Errorf("an error occurred while parsing 4.3.0 bundle: %w", err)
		}
		client, _, err := base.NewFHIR430Client(m.Context, m.AppConfig, m.Logger, *m.Source, http.DefaultClient)
		if err != nil {
			return fmt.Errorf("an error occurred while creating 4.3.0 client: %w", err)
		}
		resourceFhirList, err = client.ProcessBundle(bundle430Data)
		if err != nil {
			return fmt.Errorf("an error occurred while processing 4.3.0 resources: %w", err)
		}
	case "fhir401":
		bundle401Data := fhir401.Bundle{}
		err := base.ParseBundle(bundleFile, &bundle401Data)
		if err != nil {
			return fmt.Errorf("an error occurred while parsing 4.0.1 bundle: %w", err)
		}
		client, _, err := base.NewFHIR401Client(m.Context, m.AppConfig, m.Logger, *m.Source, http.DefaultClient)
		if err != nil {
			return fmt.Errorf("an error occurred while creating 4.0.1 client: %w", err)
		}
		resourceFhirList, err = client.ProcessBundle(bundle401Data)
		if err != nil {
			return fmt.Errorf("an error occurred while processing 4.0.1 resources: %w", err)
		}
	}
	// we need to upsert all resources (and make sure they are associated with new Source)
	for _, apiModel := range resourceFhirList {
		err = db.UpsertResource(context.Background(), &apiModel)
		if err != nil {
			return fmt.Errorf("an error occurred while upserting resources: %w", err)
		}
	}
	return nil
}

func (m ManualClient) ExtractPatientId(bundleFile *os.File) (string, string, error) {
	// try from newest format to the oldest format
	bundle430Data := fhir430.Bundle{}
	bundle401Data := fhir401.Bundle{}

	var patientIds []string

	bundleType := "fhir430"
	if err := base.ParseBundle(bundleFile, &bundle430Data); err == nil {
		patientIds = lo.FilterMap[fhir430.BundleEntry, string](bundle430Data.Entry, func(bundleEntry fhir430.BundleEntry, _ int) (string, bool) {
			parsedResource, err := fhir430utils.MapToResource(bundleEntry.Resource, false)
			if err != nil {
				return "", false
			}
			typedResource := parsedResource.(base.ResourceInterface)
			resourceType, resourceId := typedResource.ResourceRef()

			if resourceId == nil || len(*resourceId) == 0 {
				return "", false
			}
			return *resourceId, resourceType == fhir430.ResourceTypePatient.String()
		})
	}
	bundleFile.Seek(0, io.SeekStart)

	//fallback
	if patientIds == nil || len(patientIds) == 0 {
		bundleType = "fhir401"
		//try parsing the bundle as a 401 bundle
		//TODO: find a better, more generic way to do this.
		err := base.ParseBundle(bundleFile, &bundle401Data)
		if err != nil {
			return "", "", err
		}
		patientIds = lo.FilterMap[fhir401.BundleEntry, string](bundle401Data.Entry, func(bundleEntry fhir401.BundleEntry, _ int) (string, bool) {
			parsedResource, err := fhir401utils.MapToResource(bundleEntry.Resource, false)
			if err != nil {
				return "", false
			}
			typedResource := parsedResource.(base.ResourceInterface)
			resourceType, resourceId := typedResource.ResourceRef()

			if resourceId == nil || len(*resourceId) == 0 {
				return "", false
			}
			return *resourceId, resourceType == fhir430.ResourceTypePatient.String()
		})
	}
	bundleFile.Seek(0, io.SeekStart)

	if patientIds == nil || len(patientIds) == 0 {
		return "", "", fmt.Errorf("could not determine patient id")
	} else {
		//reset reader

		return strings.TrimLeft(patientIds[0], "Patient/"), bundleType, nil
	}
}

func NewClient(ctx context.Context, appConfig config.Interface, globalLogger logrus.FieldLogger, source models.Source, testHttpClient ...*http.Client) (base.Client, *models.Source, error) {
	return ManualClient{
		Context:   ctx,
		AppConfig: appConfig,
		Logger:    globalLogger,
		Source: &models.Source{
			SourceType: pkg.SourceTypeManual,
		},
	}, nil, nil
}
