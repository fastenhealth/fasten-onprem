package base

import (
	"fmt"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/fastenhealth/gofhir-models/fhir401"
	"github.com/sirupsen/logrus"
	"net/http"
	"time"
)

type FHIR401Client struct {
	*BaseClient
}

func NewFHIR401Client(appConfig config.Interface, globalLogger logrus.FieldLogger, source models.Source, testHttpClient ...*http.Client) (*FHIR401Client, error) {
	return &FHIR401Client{
		NewBaseClient(appConfig, globalLogger, source, testHttpClient...),
	}, nil
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FHIR
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
func (c *FHIR401Client) GetPatientEverything(patientId string) (*fhir401.Bundle, error) {

	// https://www.hl7.org/fhir/patient-operation-everything.html
	bundle := fhir401.Bundle{}
	err := c.GetRequest(fmt.Sprintf("Patient/%s/$everything", patientId), &bundle)
	return &bundle, err

}

func (c *FHIR401Client) GetPatient(patientId string) (*fhir401.Patient, error) {

	patient := fhir401.Patient{}
	err := c.GetRequest(fmt.Sprintf("Patient/%s", patientId), &patient)
	return &patient, err
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Process & Generate API/Database Models
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
func (c *FHIR401Client) ProcessPatients(patients []fhir401.Patient) ([]models.Profile, error) {
	profiles := []models.Profile{}
	for _, item := range patients {
		c.Logger.Debugf("item %v", item)
		patientProfile := models.Profile{
			OriginBase: models.OriginBase{
				ModelBase:          models.ModelBase{},
				UserID:             c.Source.UserID,
				SourceID:           c.Source.ID,
				SourceResourceID:   *item.Id,
				SourceResourceType: fhir401.ResourceTypePatient.Code(),
			},
			Demographics: models.Demographics{
				Address: models.Address{},
				Name:    models.Name{},
			},
		}

		if item.Meta != nil && item.Meta.LastUpdated != nil {
			if parsed, err := time.Parse(time.RFC3339Nano, *item.Meta.LastUpdated); err == nil {
				patientProfile.UpdatedAt = parsed
			}
		}

		if item.Address != nil && len(item.Address) > 0 {
			itemAddress := item.Address[0]
			patientProfile.Demographics.Address.City = itemAddress.City
			patientProfile.Demographics.Address.Country = itemAddress.Country
			patientProfile.Demographics.Address.State = itemAddress.State
			patientProfile.Demographics.Address.Street = itemAddress.Line
			patientProfile.Demographics.Address.Zip = itemAddress.PostalCode

		}
		patientProfile.Demographics.Dob = item.BirthDate

		if item.Gender != nil {
			itemGenderStr := item.Gender.String()
			itemGenderCode := item.Gender.Code()
			patientProfile.Demographics.Gender = &itemGenderStr
			patientProfile.Demographics.GenderCodes = &itemGenderCode
		}
		patientProfile.Demographics.Language = item.Language

		if item.MaritalStatus != nil {
			patientProfile.Demographics.MaritalStatus = item.MaritalStatus.Text
			if len(item.MaritalStatus.Coding) > 0 {
				patientProfile.Demographics.MaritalStatusCodes = item.MaritalStatus.Coding[0].Code
			}
		}
		if item.Name != nil && len(item.Name) > 0 {
			itemName := item.Name[0]
			if itemName.Prefix != nil && len(itemName.Prefix) > 0 {
				itemNamePrefix := itemName.Prefix[0]
				patientProfile.Demographics.Name.Prefix = &itemNamePrefix
			}
			patientProfile.Demographics.Name.Given = itemName.Given
			patientProfile.Demographics.Name.Family = itemName.Family

		}
		profiles = append(profiles, patientProfile)
	}

	return profiles, nil
}

func (c *FHIR401Client) ProcessOrganizations(orgs []fhir401.Organization) ([]models.Organization, error) {
	apiOrganizations := []models.Organization{}
	for _, org := range orgs {
		apiOrganization := models.Organization{
			OriginBase: models.OriginBase{
				ModelBase:          models.ModelBase{},
				UserID:             c.Source.UserID,
				SourceID:           c.Source.ID,
				SourceResourceID:   *org.Id,
				SourceResourceType: fhir401.ResourceTypeOrganization.Code(),
			},
			Address: models.Address{},
		}

		if org.Meta != nil && org.Meta.LastUpdated != nil {
			if parsed, err := time.Parse(time.RFC3339, *org.Meta.LastUpdated); err == nil {
				apiOrganization.UpdatedAt = parsed
			}
		}

		if org.Address != nil && len(org.Address) > 0 {
			itemAddress := org.Address[0]
			apiOrganization.Address.City = itemAddress.City
			apiOrganization.Address.Country = itemAddress.Country
			apiOrganization.Address.State = itemAddress.State
			apiOrganization.Address.Street = itemAddress.Line
			apiOrganization.Address.Zip = itemAddress.PostalCode
		}
		apiOrganization.Name = org.Name
		apiOrganization.Active = org.Active

		apiOrganizations = append(apiOrganizations, apiOrganization)
	}
	return apiOrganizations, nil
}
