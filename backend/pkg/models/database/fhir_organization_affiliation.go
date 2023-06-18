// THIS FILE IS GENERATED BY https://github.com/fastenhealth/fasten-onprem/blob/main/backend/pkg/models/database/generate.go
// PLEASE DO NOT EDIT BY HAND

package database

import (
	"encoding/json"
	"fmt"
	goja "github.com/dop251/goja"
	models "github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	datatypes "gorm.io/datatypes"
	"time"
)

type FhirOrganizationAffiliation struct {
	models.OriginBase
	// Whether this organization affiliation record is in active use
	// https://hl7.org/fhir/r4/search.html#token
	Active datatypes.JSON `gorm:"column:active;type:text;serializer:json" json:"active,omitempty"`
	// The period during which the participatingOrganization is affiliated with the primary organization
	// https://hl7.org/fhir/r4/search.html#date
	Date time.Time `gorm:"column:date;type:datetime" json:"date,omitempty"`
	// A value in an email contact
	// https://hl7.org/fhir/r4/search.html#token
	Email datatypes.JSON `gorm:"column:email;type:text;serializer:json" json:"email,omitempty"`
	// Technical endpoints providing access to services operated for this role
	// https://hl7.org/fhir/r4/search.html#reference
	Endpoint datatypes.JSON `gorm:"column:endpoint;type:text;serializer:json" json:"endpoint,omitempty"`
	// An organization affiliation's Identifier
	// https://hl7.org/fhir/r4/search.html#token
	Identifier datatypes.JSON `gorm:"column:identifier;type:text;serializer:json" json:"identifier,omitempty"`
	// Language of the resource content
	// https://hl7.org/fhir/r4/search.html#token
	Language datatypes.JSON `gorm:"column:language;type:text;serializer:json" json:"language,omitempty"`
	// When the resource version last changed
	// https://hl7.org/fhir/r4/search.html#date
	LastUpdated time.Time `gorm:"column:lastUpdated;type:datetime" json:"lastUpdated,omitempty"`
	// The location(s) at which the role occurs
	// https://hl7.org/fhir/r4/search.html#reference
	Location datatypes.JSON `gorm:"column:location;type:text;serializer:json" json:"location,omitempty"`
	// Health insurance provider network in which the participatingOrganization provides the role's services (if defined) at the indicated locations (if defined)
	// https://hl7.org/fhir/r4/search.html#reference
	Network datatypes.JSON `gorm:"column:network;type:text;serializer:json" json:"network,omitempty"`
	// The organization that provides services to the primary organization
	// https://hl7.org/fhir/r4/search.html#reference
	ParticipatingOrganization datatypes.JSON `gorm:"column:participatingOrganization;type:text;serializer:json" json:"participatingOrganization,omitempty"`
	// A value in a phone contact
	// https://hl7.org/fhir/r4/search.html#token
	Phone datatypes.JSON `gorm:"column:phone;type:text;serializer:json" json:"phone,omitempty"`
	// The organization that receives the services from the participating organization
	// https://hl7.org/fhir/r4/search.html#reference
	PrimaryOrganization datatypes.JSON `gorm:"column:primaryOrganization;type:text;serializer:json" json:"primaryOrganization,omitempty"`
	// Profiles this resource claims to conform to
	// https://hl7.org/fhir/r4/search.html#reference
	Profile datatypes.JSON `gorm:"column:profile;type:text;serializer:json" json:"profile,omitempty"`
	// The raw resource content in JSON format
	// https://hl7.org/fhir/r4/search.html#special
	RawResource datatypes.JSON `gorm:"column:rawResource;type:text;serializer:json" json:"rawResource,omitempty"`
	// Definition of the role the participatingOrganization plays
	// https://hl7.org/fhir/r4/search.html#token
	Role datatypes.JSON `gorm:"column:role;type:text;serializer:json" json:"role,omitempty"`
	// Healthcare services provided through the role
	// https://hl7.org/fhir/r4/search.html#reference
	Service datatypes.JSON `gorm:"column:service;type:text;serializer:json" json:"service,omitempty"`
	// Identifies where the resource comes from
	// https://hl7.org/fhir/r4/search.html#uri
	SourceUri string `gorm:"column:sourceUri;type:text" json:"sourceUri,omitempty"`
	// Specific specialty of the participatingOrganization in the context of the role
	// https://hl7.org/fhir/r4/search.html#token
	Specialty datatypes.JSON `gorm:"column:specialty;type:text;serializer:json" json:"specialty,omitempty"`
	// Tags applied to this resource
	// https://hl7.org/fhir/r4/search.html#token
	Tag datatypes.JSON `gorm:"column:tag;type:text;serializer:json" json:"tag,omitempty"`
	// The value in any kind of contact
	// https://hl7.org/fhir/r4/search.html#token
	Telecom datatypes.JSON `gorm:"column:telecom;type:text;serializer:json" json:"telecom,omitempty"`
	// Text search against the narrative
	// https://hl7.org/fhir/r4/search.html#string
	Text string `gorm:"column:text;type:text" json:"text,omitempty"`
	// A resource type filter
	// https://hl7.org/fhir/r4/search.html#special
	Type datatypes.JSON `gorm:"column:type;type:text;serializer:json" json:"type,omitempty"`
}

func (s *FhirOrganizationAffiliation) SetOriginBase(originBase models.OriginBase) {
	s.OriginBase = originBase
}
func (s *FhirOrganizationAffiliation) GetSearchParameters() map[string]string {
	searchParameters := map[string]string{
		"active":                    "token",
		"date":                      "date",
		"email":                     "token",
		"endpoint":                  "reference",
		"identifier":                "token",
		"language":                  "token",
		"lastUpdated":               "date",
		"location":                  "reference",
		"network":                   "reference",
		"participatingOrganization": "reference",
		"phone":                     "token",
		"primaryOrganization":       "reference",
		"profile":                   "reference",
		"rawResource":               "special",
		"role":                      "token",
		"service":                   "reference",
		"sourceUri":                 "uri",
		"specialty":                 "token",
		"tag":                       "token",
		"telecom":                   "token",
		"text":                      "string",
		"type":                      "special",
	}
	return searchParameters
}
func (s *FhirOrganizationAffiliation) PopulateAndExtractSearchParameters(rawResource json.RawMessage) error {
	s.RawResource = datatypes.JSON(rawResource)
	// unmarshal the raw resource (bytes) into a map
	var rawResourceMap map[string]interface{}
	err := json.Unmarshal(rawResource, &rawResourceMap)
	if err != nil {
		return err
	}
	if len(fhirPathJs) == 0 {
		return fmt.Errorf("fhirPathJs script is empty")
	}
	vm := goja.New()
	// setup the global window object
	vm.Set("window", vm.NewObject())
	// set the global FHIR Resource object
	vm.Set("fhirResource", rawResourceMap)
	// compile the fhirpath library
	fhirPathJsProgram, err := goja.Compile("fhirpath.min.js", fhirPathJs, true)
	if err != nil {
		return err
	}
	// add the fhirpath library in the goja vm
	_, err = vm.RunProgram(fhirPathJsProgram)
	if err != nil {
		return err
	}
	// execute the fhirpath expression for each search parameter
	// extracting Active
	activeResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'OrganizationAffiliation.active'))")
	if err == nil && activeResult.String() != "undefined" {
		s.Active = []byte(activeResult.String())
	}
	// extracting Date
	dateResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'OrganizationAffiliation.period')[0]")
	if err == nil && dateResult.String() != "undefined" {
		t, err := time.Parse(time.RFC3339, dateResult.String())
		if err == nil {
			s.Date = t
		}
	}
	// extracting Email
	emailResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'OrganizationAffiliation.telecom.where(system='email')'))")
	if err == nil && emailResult.String() != "undefined" {
		s.Email = []byte(emailResult.String())
	}
	// extracting Endpoint
	endpointResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'OrganizationAffiliation.endpoint'))")
	if err == nil && endpointResult.String() != "undefined" {
		s.Endpoint = []byte(endpointResult.String())
	}
	// extracting Identifier
	identifierResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'OrganizationAffiliation.identifier'))")
	if err == nil && identifierResult.String() != "undefined" {
		s.Identifier = []byte(identifierResult.String())
	}
	// extracting Language
	languageResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Resource.language'))")
	if err == nil && languageResult.String() != "undefined" {
		s.Language = []byte(languageResult.String())
	}
	// extracting LastUpdated
	lastUpdatedResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'Resource.meta.lastUpdated')[0]")
	if err == nil && lastUpdatedResult.String() != "undefined" {
		t, err := time.Parse(time.RFC3339, lastUpdatedResult.String())
		if err == nil {
			s.LastUpdated = t
		}
	}
	// extracting Location
	locationResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'OrganizationAffiliation.location'))")
	if err == nil && locationResult.String() != "undefined" {
		s.Location = []byte(locationResult.String())
	}
	// extracting Network
	networkResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'OrganizationAffiliation.network'))")
	if err == nil && networkResult.String() != "undefined" {
		s.Network = []byte(networkResult.String())
	}
	// extracting ParticipatingOrganization
	participatingOrganizationResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'OrganizationAffiliation.participatingOrganization'))")
	if err == nil && participatingOrganizationResult.String() != "undefined" {
		s.ParticipatingOrganization = []byte(participatingOrganizationResult.String())
	}
	// extracting Phone
	phoneResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'OrganizationAffiliation.telecom.where(system='phone')'))")
	if err == nil && phoneResult.String() != "undefined" {
		s.Phone = []byte(phoneResult.String())
	}
	// extracting PrimaryOrganization
	primaryOrganizationResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'OrganizationAffiliation.organization'))")
	if err == nil && primaryOrganizationResult.String() != "undefined" {
		s.PrimaryOrganization = []byte(primaryOrganizationResult.String())
	}
	// extracting Profile
	profileResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Resource.meta.profile'))")
	if err == nil && profileResult.String() != "undefined" {
		s.Profile = []byte(profileResult.String())
	}
	// extracting Role
	roleResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'OrganizationAffiliation.code'))")
	if err == nil && roleResult.String() != "undefined" {
		s.Role = []byte(roleResult.String())
	}
	// extracting Service
	serviceResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'OrganizationAffiliation.healthcareService'))")
	if err == nil && serviceResult.String() != "undefined" {
		s.Service = []byte(serviceResult.String())
	}
	// extracting SourceUri
	sourceUriResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'Resource.meta.source')[0]")
	if err == nil && sourceUriResult.String() != "undefined" {
		s.SourceUri = sourceUriResult.String()
	}
	// extracting Specialty
	specialtyResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'OrganizationAffiliation.specialty'))")
	if err == nil && specialtyResult.String() != "undefined" {
		s.Specialty = []byte(specialtyResult.String())
	}
	// extracting Tag
	tagResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Resource.meta.tag'))")
	if err == nil && tagResult.String() != "undefined" {
		s.Tag = []byte(tagResult.String())
	}
	// extracting Telecom
	telecomResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'OrganizationAffiliation.telecom'))")
	if err == nil && telecomResult.String() != "undefined" {
		s.Telecom = []byte(telecomResult.String())
	}
	return nil
}
