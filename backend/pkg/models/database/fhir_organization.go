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

type FhirOrganization struct {
	models.OriginBase
	// Is the Organization record active
	// https://hl7.org/fhir/r4/search.html#token
	Active datatypes.JSON `gorm:"column:active;type:text;serializer:json" json:"active,omitempty"`
	// A server defined search that may match any of the string fields in the Address, including line, city, district, state, country, postalCode, and/or text
	// https://hl7.org/fhir/r4/search.html#string
	Address string `gorm:"column:address;type:text" json:"address,omitempty"`
	// A city specified in an address
	// https://hl7.org/fhir/r4/search.html#string
	AddressCity string `gorm:"column:addressCity;type:text" json:"addressCity,omitempty"`
	// A country specified in an address
	// https://hl7.org/fhir/r4/search.html#string
	AddressCountry string `gorm:"column:addressCountry;type:text" json:"addressCountry,omitempty"`
	// A postal code specified in an address
	// https://hl7.org/fhir/r4/search.html#string
	AddressPostalcode string `gorm:"column:addressPostalcode;type:text" json:"addressPostalcode,omitempty"`
	// A state specified in an address
	// https://hl7.org/fhir/r4/search.html#string
	AddressState string `gorm:"column:addressState;type:text" json:"addressState,omitempty"`
	// A use code specified in an address
	// https://hl7.org/fhir/r4/search.html#token
	AddressUse datatypes.JSON `gorm:"column:addressUse;type:text;serializer:json" json:"addressUse,omitempty"`
	// Technical endpoints providing access to services operated for the organization
	// https://hl7.org/fhir/r4/search.html#reference
	Endpoint datatypes.JSON `gorm:"column:endpoint;type:text;serializer:json" json:"endpoint,omitempty"`
	// Any identifier for the organization (not the accreditation issuer's identifier)
	// https://hl7.org/fhir/r4/search.html#token
	Identifier datatypes.JSON `gorm:"column:identifier;type:text;serializer:json" json:"identifier,omitempty"`
	// Language of the resource content
	// https://hl7.org/fhir/r4/search.html#token
	Language datatypes.JSON `gorm:"column:language;type:text;serializer:json" json:"language,omitempty"`
	// When the resource version last changed
	// https://hl7.org/fhir/r4/search.html#date
	LastUpdated time.Time `gorm:"column:lastUpdated;type:datetime" json:"lastUpdated,omitempty"`
	// A portion of the organization's name or alias
	// https://hl7.org/fhir/r4/search.html#string
	Name string `gorm:"column:name;type:text" json:"name,omitempty"`
	// An organization of which this organization forms a part
	// https://hl7.org/fhir/r4/search.html#reference
	Partof datatypes.JSON `gorm:"column:partof;type:text;serializer:json" json:"partof,omitempty"`
	// A portion of the organization's name using some kind of phonetic matching algorithm
	// https://hl7.org/fhir/r4/search.html#string
	Phonetic string `gorm:"column:phonetic;type:text" json:"phonetic,omitempty"`
	// Profiles this resource claims to conform to
	// https://hl7.org/fhir/r4/search.html#reference
	Profile datatypes.JSON `gorm:"column:profile;type:text;serializer:json" json:"profile,omitempty"`
	// The raw resource content in JSON format
	// https://hl7.org/fhir/r4/search.html#special
	RawResource datatypes.JSON `gorm:"column:rawResource;type:text;serializer:json" json:"rawResource,omitempty"`
	// Identifies where the resource comes from
	// https://hl7.org/fhir/r4/search.html#uri
	SourceUri string `gorm:"column:sourceUri;type:text" json:"sourceUri,omitempty"`
	// Tags applied to this resource
	// https://hl7.org/fhir/r4/search.html#token
	Tag datatypes.JSON `gorm:"column:tag;type:text;serializer:json" json:"tag,omitempty"`
	// Text search against the narrative
	// https://hl7.org/fhir/r4/search.html#string
	Text string `gorm:"column:text;type:text" json:"text,omitempty"`
	// A resource type filter
	// https://hl7.org/fhir/r4/search.html#special
	Type datatypes.JSON `gorm:"column:type;type:text;serializer:json" json:"type,omitempty"`
}

func (s *FhirOrganization) SetOriginBase(originBase models.OriginBase) {
	s.OriginBase = originBase
}
func (s *FhirOrganization) GetSearchParameters() map[string]string {
	searchParameters := map[string]string{
		"active":            "token",
		"address":           "string",
		"addressCity":       "string",
		"addressCountry":    "string",
		"addressPostalcode": "string",
		"addressState":      "string",
		"addressUse":        "token",
		"endpoint":          "reference",
		"identifier":        "token",
		"language":          "token",
		"lastUpdated":       "date",
		"name":              "string",
		"partof":            "reference",
		"phonetic":          "string",
		"profile":           "reference",
		"rawResource":       "special",
		"sourceUri":         "uri",
		"tag":               "token",
		"text":              "string",
		"type":              "special",
	}
	return searchParameters
}
func (s *FhirOrganization) PopulateAndExtractSearchParameters(rawResource json.RawMessage) error {
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
	activeResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Organization.active'))")
	if err == nil && activeResult.String() != "undefined" {
		s.Active = []byte(activeResult.String())
	}
	// extracting Address
	addressResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'Organization.address')[0]")
	if err == nil && addressResult.String() != "undefined" {
		s.Address = addressResult.String()
	}
	// extracting AddressCity
	addressCityResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'Organization.address.city')[0]")
	if err == nil && addressCityResult.String() != "undefined" {
		s.AddressCity = addressCityResult.String()
	}
	// extracting AddressCountry
	addressCountryResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'Organization.address.country')[0]")
	if err == nil && addressCountryResult.String() != "undefined" {
		s.AddressCountry = addressCountryResult.String()
	}
	// extracting AddressPostalcode
	addressPostalcodeResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'Organization.address.postalCode')[0]")
	if err == nil && addressPostalcodeResult.String() != "undefined" {
		s.AddressPostalcode = addressPostalcodeResult.String()
	}
	// extracting AddressState
	addressStateResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'Organization.address.state')[0]")
	if err == nil && addressStateResult.String() != "undefined" {
		s.AddressState = addressStateResult.String()
	}
	// extracting AddressUse
	addressUseResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Organization.address.use'))")
	if err == nil && addressUseResult.String() != "undefined" {
		s.AddressUse = []byte(addressUseResult.String())
	}
	// extracting Endpoint
	endpointResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Organization.endpoint'))")
	if err == nil && endpointResult.String() != "undefined" {
		s.Endpoint = []byte(endpointResult.String())
	}
	// extracting Identifier
	identifierResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Organization.identifier'))")
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
	// extracting Name
	nameResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'Organization.name | Organization.alias')[0]")
	if err == nil && nameResult.String() != "undefined" {
		s.Name = nameResult.String()
	}
	// extracting Partof
	partofResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Organization.partOf'))")
	if err == nil && partofResult.String() != "undefined" {
		s.Partof = []byte(partofResult.String())
	}
	// extracting Phonetic
	phoneticResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'Organization.name')[0]")
	if err == nil && phoneticResult.String() != "undefined" {
		s.Phonetic = phoneticResult.String()
	}
	// extracting Profile
	profileResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Resource.meta.profile'))")
	if err == nil && profileResult.String() != "undefined" {
		s.Profile = []byte(profileResult.String())
	}
	// extracting SourceUri
	sourceUriResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'Resource.meta.source')[0]")
	if err == nil && sourceUriResult.String() != "undefined" {
		s.SourceUri = sourceUriResult.String()
	}
	// extracting Tag
	tagResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Resource.meta.tag'))")
	if err == nil && tagResult.String() != "undefined" {
		s.Tag = []byte(tagResult.String())
	}
	return nil
}

// TableName overrides the table name from fhir_observations (pluralized) to `fhir_observation`. https://gorm.io/docs/conventions.html#TableName
func (s *FhirOrganization) TableName() string {
	return "fhir_organization"
}
