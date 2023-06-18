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

type FhirDevice struct {
	models.OriginBase
	// A server defined search that may match any of the string fields in Device.deviceName or Device.type.
	// https://hl7.org/fhir/r4/search.html#string
	DeviceName string `gorm:"column:deviceName;type:text" json:"deviceName,omitempty"`
	// Instance id from manufacturer, owner, and others
	// https://hl7.org/fhir/r4/search.html#token
	Identifier datatypes.JSON `gorm:"column:identifier;type:text;serializer:json" json:"identifier,omitempty"`
	// Language of the resource content
	// https://hl7.org/fhir/r4/search.html#token
	Language datatypes.JSON `gorm:"column:language;type:text;serializer:json" json:"language,omitempty"`
	// When the resource version last changed
	// https://hl7.org/fhir/r4/search.html#date
	LastUpdated time.Time `gorm:"column:lastUpdated;type:datetime" json:"lastUpdated,omitempty"`
	// A location, where the resource is found
	// https://hl7.org/fhir/r4/search.html#reference
	Location datatypes.JSON `gorm:"column:location;type:text;serializer:json" json:"location,omitempty"`
	// The manufacturer of the device
	// https://hl7.org/fhir/r4/search.html#string
	Manufacturer string `gorm:"column:manufacturer;type:text" json:"manufacturer,omitempty"`
	// The model of the device
	// https://hl7.org/fhir/r4/search.html#string
	Model string `gorm:"column:model;type:text" json:"model,omitempty"`
	// The organization responsible for the device
	// https://hl7.org/fhir/r4/search.html#reference
	Organization datatypes.JSON `gorm:"column:organization;type:text;serializer:json" json:"organization,omitempty"`
	// Profiles this resource claims to conform to
	// https://hl7.org/fhir/r4/search.html#reference
	Profile datatypes.JSON `gorm:"column:profile;type:text;serializer:json" json:"profile,omitempty"`
	// The raw resource content in JSON format
	// https://hl7.org/fhir/r4/search.html#special
	RawResource datatypes.JSON `gorm:"column:rawResource;type:text;serializer:json" json:"rawResource,omitempty"`
	// Identifies where the resource comes from
	// https://hl7.org/fhir/r4/search.html#uri
	SourceUri string `gorm:"column:sourceUri;type:text" json:"sourceUri,omitempty"`
	// active | inactive | entered-in-error | unknown
	// https://hl7.org/fhir/r4/search.html#token
	Status datatypes.JSON `gorm:"column:status;type:text;serializer:json" json:"status,omitempty"`
	// Tags applied to this resource
	// https://hl7.org/fhir/r4/search.html#token
	Tag datatypes.JSON `gorm:"column:tag;type:text;serializer:json" json:"tag,omitempty"`
	// Text search against the narrative
	// https://hl7.org/fhir/r4/search.html#string
	Text string `gorm:"column:text;type:text" json:"text,omitempty"`
	// A resource type filter
	// https://hl7.org/fhir/r4/search.html#special
	Type datatypes.JSON `gorm:"column:type;type:text;serializer:json" json:"type,omitempty"`
	// UDI Barcode (RFID or other technology) string in *HRF* format.
	// https://hl7.org/fhir/r4/search.html#string
	UdiCarrier string `gorm:"column:udiCarrier;type:text" json:"udiCarrier,omitempty"`
	// The udi Device Identifier (DI)
	// https://hl7.org/fhir/r4/search.html#string
	UdiDi string `gorm:"column:udiDi;type:text" json:"udiDi,omitempty"`
	// Network address to contact device
	// https://hl7.org/fhir/r4/search.html#uri
	Url string `gorm:"column:url;type:text" json:"url,omitempty"`
}

func (s *FhirDevice) SetOriginBase(originBase models.OriginBase) {
	s.OriginBase = originBase
}
func (s *FhirDevice) GetSearchParameters() map[string]string {
	searchParameters := map[string]string{
		"deviceName":   "string",
		"identifier":   "token",
		"language":     "token",
		"lastUpdated":  "date",
		"location":     "reference",
		"manufacturer": "string",
		"model":        "string",
		"organization": "reference",
		"profile":      "reference",
		"rawResource":  "special",
		"sourceUri":    "uri",
		"status":       "token",
		"tag":          "token",
		"text":         "string",
		"type":         "special",
		"udiCarrier":   "string",
		"udiDi":        "string",
		"url":          "uri",
	}
	return searchParameters
}
func (s *FhirDevice) PopulateAndExtractSearchParameters(rawResource json.RawMessage) error {
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
	// extracting Organization
	organizationResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Device.owner'))")
	if err == nil && organizationResult.String() != "undefined" {
		s.Organization = []byte(organizationResult.String())
	}
	// extracting UdiDi
	udiDiResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'Device.udiCarrier.deviceIdentifier')[0]")
	if err == nil && udiDiResult.String() != "undefined" {
		s.UdiDi = udiDiResult.String()
	}
	// extracting Url
	urlResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'Device.url')[0]")
	if err == nil && urlResult.String() != "undefined" {
		s.Url = urlResult.String()
	}
	// extracting Language
	languageResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Resource.language'))")
	if err == nil && languageResult.String() != "undefined" {
		s.Language = []byte(languageResult.String())
	}
	// extracting Manufacturer
	manufacturerResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'Device.manufacturer')[0]")
	if err == nil && manufacturerResult.String() != "undefined" {
		s.Manufacturer = manufacturerResult.String()
	}
	// extracting Model
	modelResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'Device.modelNumber')[0]")
	if err == nil && modelResult.String() != "undefined" {
		s.Model = modelResult.String()
	}
	// extracting Location
	locationResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Device.location'))")
	if err == nil && locationResult.String() != "undefined" {
		s.Location = []byte(locationResult.String())
	}
	// extracting Status
	statusResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Device.status'))")
	if err == nil && statusResult.String() != "undefined" {
		s.Status = []byte(statusResult.String())
	}
	// extracting DeviceName
	deviceNameResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'Device.deviceName.name | Device.type.coding.display | Device.type.text')[0]")
	if err == nil && deviceNameResult.String() != "undefined" {
		s.DeviceName = deviceNameResult.String()
	}
	// extracting Identifier
	identifierResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Device.identifier'))")
	if err == nil && identifierResult.String() != "undefined" {
		s.Identifier = []byte(identifierResult.String())
	}
	// extracting Tag
	tagResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Resource.meta.tag'))")
	if err == nil && tagResult.String() != "undefined" {
		s.Tag = []byte(tagResult.String())
	}
	// extracting UdiCarrier
	udiCarrierResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'Device.udiCarrier.carrierHRF')[0]")
	if err == nil && udiCarrierResult.String() != "undefined" {
		s.UdiCarrier = udiCarrierResult.String()
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
	// extracting LastUpdated
	lastUpdatedResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'Resource.meta.lastUpdated')[0]")
	if err == nil && lastUpdatedResult.String() != "undefined" {
		t, err := time.Parse(time.RFC3339, lastUpdatedResult.String())
		if err == nil {
			s.LastUpdated = t
		}
	}
	return nil
}
