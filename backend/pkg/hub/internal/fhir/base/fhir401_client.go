package base

import (
	"context"
	"fmt"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/fastenhealth/gofhir-models/fhir401"
	fhirutils "github.com/fastenhealth/gofhir-models/fhir401/utils"
	"github.com/samber/lo"
	"github.com/sirupsen/logrus"
	"gorm.io/datatypes"
	"net/http"
)

type FHIR401Client struct {
	*BaseClient
}

func NewFHIR401Client(ctx context.Context, appConfig config.Interface, globalLogger logrus.FieldLogger, source models.Source, testHttpClient ...*http.Client) (*FHIR401Client, *models.Source, error) {
	baseClient, updatedSource, err := NewBaseClient(ctx, appConfig, globalLogger, source, testHttpClient...)
	return &FHIR401Client{
		baseClient,
	}, updatedSource, err
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FHIR
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
func (c *FHIR401Client) GetResourceBundle(relativeResourcePath string) (fhir401.Bundle, error) {

	// https://www.hl7.org/fhir/patient-operation-everything.html
	bundle := fhir401.Bundle{}
	err := c.GetRequest(relativeResourcePath, &bundle)
	if err != nil {
		return bundle, err
	}
	var next string
	var prev string
	var self string
	for _, link := range bundle.Link {
		if link.Relation == "next" {
			next = link.Url
		} else if link.Relation == "self" {
			self = link.Url
		} else if link.Relation == "previous" {
			prev = link.Url
		}
	}

	for len(next) > 0 && next != self && next != prev {
		c.Logger.Debugf("Paginated request => %s", next)
		nextBundle := fhir401.Bundle{}
		err := c.GetRequest(next, &nextBundle)
		if err != nil {
			return bundle, nil //ignore failures when paginating?
		}
		bundle.Entry = append(bundle.Entry, nextBundle.Entry...)

		next = "" //reset the pointers
		self = ""
		prev = ""
		for _, link := range nextBundle.Link {
			if link.Relation == "next" {
				next = link.Url
			} else if link.Relation == "self" {
				self = link.Url
			} else if link.Relation == "previous" {
				prev = link.Url
			}
		}
	}

	return bundle, err

}

func (c *FHIR401Client) GetPatientBundle(patientId string) (fhir401.Bundle, error) {
	return c.GetResourceBundle(fmt.Sprintf("Patient/%s/$everything", patientId))
}

func (c *FHIR401Client) GetPatient(patientId string) (fhir401.Patient, error) {

	patient := fhir401.Patient{}
	err := c.GetRequest(fmt.Sprintf("Patient/%s", patientId), &patient)
	return patient, err
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Process Bundles
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
func (c *FHIR401Client) ProcessBundle(bundle fhir401.Bundle) ([]models.ResourceFhir, error) {

	//process each entry in bundle
	wrappedResourceModels := lo.FilterMap[fhir401.BundleEntry, models.ResourceFhir](bundle.Entry, func(bundleEntry fhir401.BundleEntry, _ int) (models.ResourceFhir, bool) {
		originalResource, _ := fhirutils.MapToResource(bundleEntry.Resource, false)

		resourceType, resourceId := originalResource.(ResourceInterface).ResourceRef()

		// TODO find a way to safely/consistently get the resource updated date (and other metadata) which shoudl be added to the model.
		//if originalResource.Meta != nil && originalResource.Meta.LastUpdated != nil {
		//	if parsed, err := time.Parse(time.RFC3339Nano, *originalResource.Meta.LastUpdated); err == nil {
		//		patientProfile.UpdatedAt = parsed
		//	}
		//}
		if resourceId == nil {
			//no resourceId present for this resource, we'll ignore it.
			return models.ResourceFhir{}, false
		}

		wrappedResourceModel := models.ResourceFhir{
			OriginBase: models.OriginBase{
				ModelBase:          models.ModelBase{},
				UserID:             c.Source.UserID,
				SourceID:           c.Source.ID,
				SourceResourceID:   *resourceId,
				SourceResourceType: resourceType,
			},
			Payload: datatypes.JSON(bundleEntry.Resource),
		}

		return wrappedResourceModel, true
	})
	return wrappedResourceModels, nil
}
