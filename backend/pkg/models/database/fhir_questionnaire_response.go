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

type FhirQuestionnaireResponse struct {
	models.OriginBase
	// The author of the questionnaire response
	// https://hl7.org/fhir/r4/search.html#reference
	Author datatypes.JSON `gorm:"column:author;type:text;serializer:json" json:"author,omitempty"`
	// When the questionnaire response was last changed
	// https://hl7.org/fhir/r4/search.html#date
	Authored time.Time `gorm:"column:authored;type:datetime" json:"authored,omitempty"`
	// Plan/proposal/order fulfilled by this questionnaire response
	// https://hl7.org/fhir/r4/search.html#reference
	BasedOn datatypes.JSON `gorm:"column:basedOn;type:text;serializer:json" json:"basedOn,omitempty"`
	// Encounter associated with the questionnaire response
	// https://hl7.org/fhir/r4/search.html#reference
	Encounter datatypes.JSON `gorm:"column:encounter;type:text;serializer:json" json:"encounter,omitempty"`
	// The unique identifier for the questionnaire response
	// https://hl7.org/fhir/r4/search.html#token
	Identifier datatypes.JSON `gorm:"column:identifier;type:text;serializer:json" json:"identifier,omitempty"`
	// Language of the resource content
	// https://hl7.org/fhir/r4/search.html#token
	Language datatypes.JSON `gorm:"column:language;type:text;serializer:json" json:"language,omitempty"`
	// When the resource version last changed
	// https://hl7.org/fhir/r4/search.html#date
	LastUpdated time.Time `gorm:"column:lastUpdated;type:datetime" json:"lastUpdated,omitempty"`
	// Procedure or observation this questionnaire response was performed as a part of
	// https://hl7.org/fhir/r4/search.html#reference
	PartOf datatypes.JSON `gorm:"column:partOf;type:text;serializer:json" json:"partOf,omitempty"`
	// Profiles this resource claims to conform to
	// https://hl7.org/fhir/r4/search.html#reference
	Profile datatypes.JSON `gorm:"column:profile;type:text;serializer:json" json:"profile,omitempty"`
	// The questionnaire the answers are provided for
	// https://hl7.org/fhir/r4/search.html#reference
	Questionnaire datatypes.JSON `gorm:"column:questionnaire;type:text;serializer:json" json:"questionnaire,omitempty"`
	// The raw resource content in JSON format
	// https://hl7.org/fhir/r4/search.html#special
	RawResource datatypes.JSON `gorm:"column:rawResource;type:text;serializer:json" json:"rawResource,omitempty"`
	// The individual providing the information reflected in the questionnaire respose
	// https://hl7.org/fhir/r4/search.html#reference
	Source datatypes.JSON `gorm:"column:source;type:text;serializer:json" json:"source,omitempty"`
	// Identifies where the resource comes from
	// https://hl7.org/fhir/r4/search.html#uri
	SourceUri string `gorm:"column:sourceUri;type:text" json:"sourceUri,omitempty"`
	// The status of the questionnaire response
	// https://hl7.org/fhir/r4/search.html#token
	Status datatypes.JSON `gorm:"column:status;type:text;serializer:json" json:"status,omitempty"`
	// The subject of the questionnaire response
	// https://hl7.org/fhir/r4/search.html#reference
	Subject datatypes.JSON `gorm:"column:subject;type:text;serializer:json" json:"subject,omitempty"`
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

func (s *FhirQuestionnaireResponse) SetOriginBase(originBase models.OriginBase) {
	s.OriginBase = originBase
}
func (s *FhirQuestionnaireResponse) GetSearchParameters() map[string]string {
	searchParameters := map[string]string{
		"author":        "reference",
		"authored":      "date",
		"basedOn":       "reference",
		"encounter":     "reference",
		"identifier":    "token",
		"language":      "token",
		"lastUpdated":   "date",
		"partOf":        "reference",
		"profile":       "reference",
		"questionnaire": "reference",
		"rawResource":   "special",
		"source":        "reference",
		"sourceUri":     "uri",
		"status":        "token",
		"subject":       "reference",
		"tag":           "token",
		"text":          "string",
		"type":          "special",
	}
	return searchParameters
}
func (s *FhirQuestionnaireResponse) PopulateAndExtractSearchParameters(rawResource json.RawMessage) error {
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
	// extracting Author
	authorResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'QuestionnaireResponse.author'))")
	if err == nil && authorResult.String() != "undefined" {
		s.Author = []byte(authorResult.String())
	}
	// extracting Authored
	authoredResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'QuestionnaireResponse.authored')[0]")
	if err == nil && authoredResult.String() != "undefined" {
		t, err := time.Parse(time.RFC3339, authoredResult.String())
		if err == nil {
			s.Authored = t
		}
	}
	// extracting BasedOn
	basedOnResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'QuestionnaireResponse.basedOn'))")
	if err == nil && basedOnResult.String() != "undefined" {
		s.BasedOn = []byte(basedOnResult.String())
	}
	// extracting Encounter
	encounterResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'QuestionnaireResponse.encounter'))")
	if err == nil && encounterResult.String() != "undefined" {
		s.Encounter = []byte(encounterResult.String())
	}
	// extracting Identifier
	identifierResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'QuestionnaireResponse.identifier'))")
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
	// extracting PartOf
	partOfResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'QuestionnaireResponse.partOf'))")
	if err == nil && partOfResult.String() != "undefined" {
		s.PartOf = []byte(partOfResult.String())
	}
	// extracting Profile
	profileResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Resource.meta.profile'))")
	if err == nil && profileResult.String() != "undefined" {
		s.Profile = []byte(profileResult.String())
	}
	// extracting Questionnaire
	questionnaireResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'QuestionnaireResponse.questionnaire'))")
	if err == nil && questionnaireResult.String() != "undefined" {
		s.Questionnaire = []byte(questionnaireResult.String())
	}
	// extracting Source
	sourceResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'QuestionnaireResponse.source'))")
	if err == nil && sourceResult.String() != "undefined" {
		s.Source = []byte(sourceResult.String())
	}
	// extracting SourceUri
	sourceUriResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'Resource.meta.source')[0]")
	if err == nil && sourceUriResult.String() != "undefined" {
		s.SourceUri = sourceUriResult.String()
	}
	// extracting Status
	statusResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'QuestionnaireResponse.status'))")
	if err == nil && statusResult.String() != "undefined" {
		s.Status = []byte(statusResult.String())
	}
	// extracting Subject
	subjectResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'QuestionnaireResponse.subject'))")
	if err == nil && subjectResult.String() != "undefined" {
		s.Subject = []byte(subjectResult.String())
	}
	// extracting Tag
	tagResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Resource.meta.tag'))")
	if err == nil && tagResult.String() != "undefined" {
		s.Tag = []byte(tagResult.String())
	}
	return nil
}
