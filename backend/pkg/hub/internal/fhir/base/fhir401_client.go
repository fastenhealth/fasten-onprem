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
func (c *FHIR401Client) GetPatientBundle(patientId string) (fhir401.Bundle, error) {

	// https://www.hl7.org/fhir/patient-operation-everything.html
	bundle := fhir401.Bundle{}
	err := c.GetRequest(fmt.Sprintf("Patient/%s/$everything", patientId), &bundle)
	return bundle, err

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Process & Generate API/Database Models
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//func (c *FHIR401Client) ProcessPatient(item fhir401.Patient) (models.Profile, error) {
//	c.Logger.Debugf("item %v", item)
//	patientProfile := models.Profile{
//		OriginBase: models.OriginBase{
//			ModelBase:          models.ModelBase{},
//			UserID:             c.Source.UserID,
//			SourceID:           c.Source.ID,
//			SourceResourceID:   *item.Id,
//			SourceResourceType: fhir401.ResourceTypePatient.Code(),
//		},
//		Demographics: models.Demographics{
//			Address: models.Address{},
//			Name:    models.Name{},
//		},
//	}
//
//
//
//	if item.Address != nil && len(item.Address) > 0 {
//		itemAddress := item.Address[0]
//		patientProfile.Demographics.Address.City = itemAddress.City
//		patientProfile.Demographics.Address.Country = itemAddress.Country
//		patientProfile.Demographics.Address.State = itemAddress.State
//		patientProfile.Demographics.Address.Street = itemAddress.Line
//		patientProfile.Demographics.Address.Zip = itemAddress.PostalCode
//
//	}
//	patientProfile.Demographics.Dob = item.BirthDate
//
//	if item.Gender != nil {
//		itemGenderStr := item.Gender.String()
//		itemGenderCode := item.Gender.Code()
//		patientProfile.Demographics.Gender = &itemGenderStr
//		patientProfile.Demographics.GenderCodes = &itemGenderCode
//	}
//	patientProfile.Demographics.Language = item.Language
//
//	if item.MaritalStatus != nil {
//		patientProfile.Demographics.MaritalStatus = item.MaritalStatus.Text
//		if len(item.MaritalStatus.Coding) > 0 {
//			patientProfile.Demographics.MaritalStatusCodes = item.MaritalStatus.Coding[0].Code
//		}
//	}
//	if item.Name != nil && len(item.Name) > 0 {
//		itemName := item.Name[0]
//		if itemName.Prefix != nil && len(itemName.Prefix) > 0 {
//			itemNamePrefix := itemName.Prefix[0]
//			patientProfile.Demographics.Name.Prefix = &itemNamePrefix
//		}
//		patientProfile.Demographics.Name.Given = itemName.Given
//		patientProfile.Demographics.Name.Family = itemName.Family
//
//	}
//
//	return patientProfile, nil
//}
