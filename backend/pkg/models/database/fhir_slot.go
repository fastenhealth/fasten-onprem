// THIS FILE IS GENERATED BY https://github.com/fastenhealth/fasten-onprem/blob/main/backend/pkg/models/database/generate.go
// PLEASE DO NOT EDIT BY HAND

package database

import (
	"encoding/json"
	"fmt"
	goja "github.com/dop251/goja"
	models "github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	datatypes "gorm.io/datatypes"
	"time"
)

type FhirSlot struct {
	models.ResourceBase
	// The style of appointment or patient that may be booked in the slot (not service type)
	// https://hl7.org/fhir/r4/search.html#token
	AppointmentType datatypes.JSON `gorm:"column:appointmentType;type:text;serializer:json" json:"appointmentType,omitempty"`
	// A Slot Identifier
	// https://hl7.org/fhir/r4/search.html#token
	Identifier datatypes.JSON `gorm:"column:identifier;type:text;serializer:json" json:"identifier,omitempty"`
	// Language of the resource content
	// https://hl7.org/fhir/r4/search.html#token
	Language datatypes.JSON `gorm:"column:language;type:text;serializer:json" json:"language,omitempty"`
	// When the resource version last changed
	// https://hl7.org/fhir/r4/search.html#date
	MetaLastUpdated *time.Time `gorm:"column:metaLastUpdated;type:datetime" json:"metaLastUpdated,omitempty"`
	// Profiles this resource claims to conform to
	// https://hl7.org/fhir/r4/search.html#reference
	MetaProfile datatypes.JSON `gorm:"column:metaProfile;type:text;serializer:json" json:"metaProfile,omitempty"`
	// Tags applied to this resource
	// https://hl7.org/fhir/r4/search.html#token
	MetaTag datatypes.JSON `gorm:"column:metaTag;type:text;serializer:json" json:"metaTag,omitempty"`
	// Tags applied to this resource
	// This is a primitive string literal (`keyword` type). It is not a recognized SearchParameter type from https://hl7.org/fhir/r4/search.html, it's Fasten Health-specific
	MetaVersionId string `gorm:"column:metaVersionId;type:text" json:"metaVersionId,omitempty"`
	// Notes/comments
	// https://hl7.org/fhir/r4/search.html#string
	Note datatypes.JSON `gorm:"column:note;type:text;serializer:json" json:"note,omitempty"`
	// The Schedule Resource that we are seeking a slot within
	// https://hl7.org/fhir/r4/search.html#reference
	Schedule datatypes.JSON `gorm:"column:schedule;type:text;serializer:json" json:"schedule,omitempty"`
	// A broad categorization of the service that is to be performed during this appointment
	// https://hl7.org/fhir/r4/search.html#token
	ServiceCategory datatypes.JSON `gorm:"column:serviceCategory;type:text;serializer:json" json:"serviceCategory,omitempty"`
	// The type of appointments that can be booked into the slot
	// https://hl7.org/fhir/r4/search.html#token
	ServiceType datatypes.JSON `gorm:"column:serviceType;type:text;serializer:json" json:"serviceType,omitempty"`
	// The specialty of a practitioner that would be required to perform the service requested in this appointment
	// https://hl7.org/fhir/r4/search.html#token
	Specialty datatypes.JSON `gorm:"column:specialty;type:text;serializer:json" json:"specialty,omitempty"`
	// Appointment date/time.
	// https://hl7.org/fhir/r4/search.html#date
	Start *time.Time `gorm:"column:start;type:datetime" json:"start,omitempty"`
	// The free/busy status of the appointment
	// https://hl7.org/fhir/r4/search.html#token
	Status datatypes.JSON `gorm:"column:status;type:text;serializer:json" json:"status,omitempty"`
	// Text search against the narrative
	// https://hl7.org/fhir/r4/search.html#string
	Text datatypes.JSON `gorm:"column:text;type:text;serializer:json" json:"text,omitempty"`
}

func (s *FhirSlot) GetSearchParameters() map[string]string {
	searchParameters := map[string]string{
		"appointmentType":      "token",
		"id":                   "keyword",
		"identifier":           "token",
		"language":             "token",
		"metaLastUpdated":      "date",
		"metaProfile":          "reference",
		"metaTag":              "token",
		"metaVersionId":        "keyword",
		"note":                 "string",
		"schedule":             "reference",
		"serviceCategory":      "token",
		"serviceType":          "token",
		"sort_date":            "date",
		"source_id":            "keyword",
		"source_resource_id":   "keyword",
		"source_resource_type": "keyword",
		"source_uri":           "keyword",
		"specialty":            "token",
		"start":                "date",
		"status":               "token",
		"text":                 "string",
	}
	return searchParameters
}
func (s *FhirSlot) PopulateAndExtractSearchParameters(resourceRaw json.RawMessage) error {
	s.ResourceRaw = datatypes.JSON(resourceRaw)
	// unmarshal the raw resource (bytes) into a map
	var resourceRawMap map[string]interface{}
	err := json.Unmarshal(resourceRaw, &resourceRawMap)
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
	vm.Set("fhirResource", resourceRawMap)
	// compile the fhirpath library
	fhirPathJsProgram, err := goja.Compile("fhirpath.min.js", fhirPathJs, true)
	if err != nil {
		return err
	}
	// compile the searchParametersExtractor library
	searchParametersExtractorJsProgram, err := goja.Compile("searchParameterExtractor.js", searchParameterExtractorJs, true)
	if err != nil {
		return err
	}
	// add the fhirpath library in the goja vm
	_, err = vm.RunProgram(fhirPathJsProgram)
	if err != nil {
		return err
	}
	// add the searchParametersExtractor library in the goja vm
	_, err = vm.RunProgram(searchParametersExtractorJsProgram)
	if err != nil {
		return err
	}
	// execute the fhirpath expression for each search parameter
	// extracting AppointmentType
	appointmentTypeResult, err := vm.RunString("extractTokenSearchParameters(fhirResource, 'Slot.appointmentType')")
	if err == nil && appointmentTypeResult.String() != "undefined" {
		s.AppointmentType = []byte(appointmentTypeResult.String())
	}
	// extracting Identifier
	identifierResult, err := vm.RunString("extractTokenSearchParameters(fhirResource, 'Slot.identifier')")
	if err == nil && identifierResult.String() != "undefined" {
		s.Identifier = []byte(identifierResult.String())
	}
	// extracting Language
	languageResult, err := vm.RunString("extractTokenSearchParameters(fhirResource, 'language')")
	if err == nil && languageResult.String() != "undefined" {
		s.Language = []byte(languageResult.String())
	}
	// extracting MetaLastUpdated
	metaLastUpdatedResult, err := vm.RunString("extractDateSearchParameters(fhirResource, 'meta.lastUpdated')")
	if err == nil && metaLastUpdatedResult.String() != "undefined" {
		if t, err := time.Parse(time.RFC3339, metaLastUpdatedResult.String()); err == nil {
			s.MetaLastUpdated = &t
		} else if t, err = time.Parse("2006-01-02", metaLastUpdatedResult.String()); err == nil {
			s.MetaLastUpdated = &t
		} else if t, err = time.Parse("2006-01", metaLastUpdatedResult.String()); err == nil {
			s.MetaLastUpdated = &t
		} else if t, err = time.Parse("2006", metaLastUpdatedResult.String()); err == nil {
			s.MetaLastUpdated = &t
		}
	}
	// extracting MetaProfile
	metaProfileResult, err := vm.RunString("extractReferenceSearchParameters(fhirResource, 'meta.profile')")
	if err == nil && metaProfileResult.String() != "undefined" {
		s.MetaProfile = []byte(metaProfileResult.String())
	}
	// extracting MetaTag
	metaTagResult, err := vm.RunString("extractTokenSearchParameters(fhirResource, 'meta.tag')")
	if err == nil && metaTagResult.String() != "undefined" {
		s.MetaTag = []byte(metaTagResult.String())
	}
	// extracting MetaVersionId
	metaVersionIdResult, err := vm.RunString("extractSimpleSearchParameters(fhirResource, 'meta.versionId')")
	if err == nil && metaVersionIdResult.String() != "undefined" {
		s.MetaVersionId = metaVersionIdResult.String()
	}
	// extracting Note
	noteResult, err := vm.RunString("extractStringSearchParameters(fhirResource, 'note')")
	if err == nil && noteResult.String() != "undefined" {
		s.Note = []byte(noteResult.String())
	}
	// extracting Schedule
	scheduleResult, err := vm.RunString("extractReferenceSearchParameters(fhirResource, 'Slot.schedule')")
	if err == nil && scheduleResult.String() != "undefined" {
		s.Schedule = []byte(scheduleResult.String())
	}
	// extracting ServiceCategory
	serviceCategoryResult, err := vm.RunString("extractTokenSearchParameters(fhirResource, 'Slot.serviceCategory')")
	if err == nil && serviceCategoryResult.String() != "undefined" {
		s.ServiceCategory = []byte(serviceCategoryResult.String())
	}
	// extracting ServiceType
	serviceTypeResult, err := vm.RunString("extractTokenSearchParameters(fhirResource, 'Slot.serviceType')")
	if err == nil && serviceTypeResult.String() != "undefined" {
		s.ServiceType = []byte(serviceTypeResult.String())
	}
	// extracting Specialty
	specialtyResult, err := vm.RunString("extractTokenSearchParameters(fhirResource, 'Slot.specialty')")
	if err == nil && specialtyResult.String() != "undefined" {
		s.Specialty = []byte(specialtyResult.String())
	}
	// extracting Start
	startResult, err := vm.RunString("extractDateSearchParameters(fhirResource, 'Slot.start')")
	if err == nil && startResult.String() != "undefined" {
		if t, err := time.Parse(time.RFC3339, startResult.String()); err == nil {
			s.Start = &t
		} else if t, err = time.Parse("2006-01-02", startResult.String()); err == nil {
			s.Start = &t
		} else if t, err = time.Parse("2006-01", startResult.String()); err == nil {
			s.Start = &t
		} else if t, err = time.Parse("2006", startResult.String()); err == nil {
			s.Start = &t
		}
	}
	// extracting Status
	statusResult, err := vm.RunString("extractTokenSearchParameters(fhirResource, 'Slot.status')")
	if err == nil && statusResult.String() != "undefined" {
		s.Status = []byte(statusResult.String())
	}
	// extracting Text
	textResult, err := vm.RunString("extractStringSearchParameters(fhirResource, 'text')")
	if err == nil && textResult.String() != "undefined" {
		s.Text = []byte(textResult.String())
	}
	return nil
}

// TableName overrides the table name from fhir_observations (pluralized) to `fhir_observation`. https://gorm.io/docs/conventions.html#TableName
func (s *FhirSlot) TableName() string {
	return "fhir_slot"
}
