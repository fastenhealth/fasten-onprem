package base

import (
	"fmt"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/fastenhealth/gofhir-models/fhir401"
	fhirutils "github.com/fastenhealth/gofhir-models/fhir401/utils"
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

// GenerateResourceDependencyGraph
// FHIR resources can reference/depend on other resources.
// When storing processed models in the database, we need to make sure that we insert them in dependency order,
// so that we can correctly update all references
func (c *FHIR401Client) GenerateResourceDependencyGraph() {

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Process Bundles
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
func (c *FHIR401Client) ProcessBundle(bundle fhir401.Bundle) (DependencyGraph, map[string]interface{}, []string, error) {
	// this lookup dict maps resource references to API models
	resourceRefApiModelLookup := map[string]interface{}{}

	// this map contains resource references, and a list of other resources that depend on it.
	resourceRefDependencyGraph := DependencyGraph{}

	//list of all resources
	allResources := []interface{}{}

	skippedResources := []string{}
	for _, bundleEntry := range bundle.Entry {
		resource, _ := fhirutils.MapToResource(bundleEntry.Resource, false)
		allResources = append(allResources, resource)

		switch resource.(type) {
		case fhir401.Patient:
			typedResource := resource.(fhir401.Patient)
			apiProfile, err := c.ProcessPatient(typedResource)
			if err != nil {
				return nil, nil, nil, err
			}
			resourceType, resourceId := typedResource.ResourceRef()
			resourceRef := fmt.Sprintf("%s/%s", resourceType, *resourceId)
			resourceRefApiModelLookup[resourceRef] = apiProfile
			resourceRefDependencyGraph.AddDependencies(resourceRef, []string{})
		case fhir401.Organization:
			typedResource := resource.(fhir401.Organization)
			apiOrganization, err := c.ProcessOrganization(typedResource)
			if err != nil {
				return nil, nil, nil, err
			}
			resourceType, resourceId := typedResource.ResourceRef()
			resourceRef := fmt.Sprintf("%s/%s", resourceType, *resourceId)
			resourceRefApiModelLookup[resourceRef] = apiOrganization
			resourceRefDependencyGraph.AddDependencies(resourceRef, []string{})
		case fhir401.Encounter:
			typedResource := resource.(fhir401.Encounter)
			apiEncounter, err := c.ProcessEncounter(typedResource)
			if err != nil {
				return nil, nil, nil, err
			}
			resourceType, resourceId := typedResource.ResourceRef()
			resourceRef := fmt.Sprintf("%s/%s", resourceType, *resourceId)
			resourceRefApiModelLookup[resourceRef] = apiEncounter
			resourceRefDependencyGraph.AddDependencies(resourceRef, []string{})
		default:
			typedResource := resource.(ResourceInterface)
			resourceType, resourceId := typedResource.ResourceRef()
			var resourceRef string
			if resourceId != nil {
				resourceRef = fmt.Sprintf("%s/%s", resourceType, *resourceId)
			} else {
				resourceRef = resourceType
			}
			skippedResources = append(skippedResources, resourceRef)
		}
	}
	return resourceRefDependencyGraph, resourceRefApiModelLookup, skippedResources, nil
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Process & Generate API/Database Models
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
func (c *FHIR401Client) ProcessPatient(item fhir401.Patient) (models.Profile, error) {
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

	return patientProfile, nil
}

func (c *FHIR401Client) ProcessOrganization(item fhir401.Organization) (models.Organization, error) {
	apiOrganization := models.Organization{
		OriginBase: models.OriginBase{
			ModelBase:          models.ModelBase{},
			UserID:             c.Source.UserID,
			SourceID:           c.Source.ID,
			SourceResourceID:   *item.Id,
			SourceResourceType: fhir401.ResourceTypeOrganization.Code(),
		},
		Address: models.Address{},
	}

	if item.Meta != nil && item.Meta.LastUpdated != nil {
		if parsed, err := time.Parse(time.RFC3339, *item.Meta.LastUpdated); err == nil {
			apiOrganization.UpdatedAt = parsed
		}
	}

	if item.Address != nil && len(item.Address) > 0 {
		itemAddress := item.Address[0]
		apiOrganization.Address.City = itemAddress.City
		apiOrganization.Address.Country = itemAddress.Country
		apiOrganization.Address.State = itemAddress.State
		apiOrganization.Address.Street = itemAddress.Line
		apiOrganization.Address.Zip = itemAddress.PostalCode
	}
	apiOrganization.Name = item.Name
	apiOrganization.Active = item.Active

	return apiOrganization, nil
}

//TODO
func (c *FHIR401Client) ProcessEncounter(item fhir401.Encounter) (models.Encounter, error) {
	apiEncounter := models.Encounter{
		OriginBase: models.OriginBase{
			ModelBase:          models.ModelBase{},
			UserID:             c.Source.UserID,
			SourceID:           c.Source.ID,
			SourceResourceID:   *item.Id,
			SourceResourceType: fhir401.ResourceTypeEncounter.Code(),
		},
		Provider: models.Provider{},
		Orders:   []models.Order{},
	}

	if item.Meta != nil && item.Meta.LastUpdated != nil {
		if parsed, err := time.Parse(time.RFC3339, *item.Meta.LastUpdated); err == nil {
			apiEncounter.UpdatedAt = parsed
		}
	}
	if item.Type != nil && len(item.Type) > 0 && item.Type[0].Coding != nil && len(item.Type[0].Coding) > 0 {
		apiEncounter.VisitType = item.Type[0].Coding[0].Code
	}

	return apiEncounter, nil
}
