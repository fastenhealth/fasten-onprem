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

type FhirProvenance struct {
	models.ResourceBase
	// Who participated
	// https://hl7.org/fhir/r4/search.html#reference
	Agent datatypes.JSON `gorm:"column:agent;type:text;serializer:json" json:"agent,omitempty"`
	// What the agents role was
	// https://hl7.org/fhir/r4/search.html#token
	AgentRole datatypes.JSON `gorm:"column:agentRole;type:text;serializer:json" json:"agentRole,omitempty"`
	// How the agent participated
	// https://hl7.org/fhir/r4/search.html#token
	AgentType datatypes.JSON `gorm:"column:agentType;type:text;serializer:json" json:"agentType,omitempty"`
	// Identity of entity
	// https://hl7.org/fhir/r4/search.html#reference
	Entity datatypes.JSON `gorm:"column:entity;type:text;serializer:json" json:"entity,omitempty"`
	// Language of the resource content
	// https://hl7.org/fhir/r4/search.html#token
	Language datatypes.JSON `gorm:"column:language;type:text;serializer:json" json:"language,omitempty"`
	// When the resource version last changed
	// https://hl7.org/fhir/r4/search.html#date
	LastUpdated *time.Time `gorm:"column:lastUpdated;type:datetime" json:"lastUpdated,omitempty"`
	// Where the activity occurred, if relevant
	// https://hl7.org/fhir/r4/search.html#reference
	Location datatypes.JSON `gorm:"column:location;type:text;serializer:json" json:"location,omitempty"`
	// Profiles this resource claims to conform to
	// https://hl7.org/fhir/r4/search.html#reference
	Profile datatypes.JSON `gorm:"column:profile;type:text;serializer:json" json:"profile,omitempty"`
	// When the activity was recorded / updated
	// https://hl7.org/fhir/r4/search.html#date
	Recorded *time.Time `gorm:"column:recorded;type:datetime" json:"recorded,omitempty"`
	// Indication of the reason the entity signed the object(s)
	// https://hl7.org/fhir/r4/search.html#token
	SignatureType datatypes.JSON `gorm:"column:signatureType;type:text;serializer:json" json:"signatureType,omitempty"`
	// Identifies where the resource comes from
	// https://hl7.org/fhir/r4/search.html#uri
	SourceUri string `gorm:"column:sourceUri;type:text" json:"sourceUri,omitempty"`
	// Tags applied to this resource
	// https://hl7.org/fhir/r4/search.html#token
	Tag datatypes.JSON `gorm:"column:tag;type:text;serializer:json" json:"tag,omitempty"`
	// Target Reference(s) (usually version specific)
	// https://hl7.org/fhir/r4/search.html#reference
	Target datatypes.JSON `gorm:"column:target;type:text;serializer:json" json:"target,omitempty"`
	// Text search against the narrative
	// https://hl7.org/fhir/r4/search.html#string
	Text datatypes.JSON `gorm:"column:text;type:text;serializer:json" json:"text,omitempty"`
	// A resource type filter
	// https://hl7.org/fhir/r4/search.html#special
	Type datatypes.JSON `gorm:"column:type;type:text;serializer:json" json:"type,omitempty"`
	// When the activity occurred
	// https://hl7.org/fhir/r4/search.html#date
	When *time.Time `gorm:"column:when;type:datetime" json:"when,omitempty"`
}

func (s *FhirProvenance) GetSearchParameters() map[string]string {
	searchParameters := map[string]string{
		"agent":         "reference",
		"agentRole":     "token",
		"agentType":     "token",
		"entity":        "reference",
		"language":      "token",
		"lastUpdated":   "date",
		"location":      "reference",
		"profile":       "reference",
		"recorded":      "date",
		"signatureType": "token",
		"sourceUri":     "uri",
		"tag":           "token",
		"target":        "reference",
		"text":          "string",
		"type":          "special",
		"when":          "date",
	}
	return searchParameters
}
func (s *FhirProvenance) PopulateAndExtractSearchParameters(resourceRaw json.RawMessage) error {
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
	// add the fhirpath library in the goja vm
	_, err = vm.RunProgram(fhirPathJsProgram)
	if err != nil {
		return err
	}
	// execute the fhirpath expression for each search parameter
	// extracting Agent
	agentResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Provenance.agent.who'))")
	if err == nil && agentResult.String() != "undefined" {
	}
	// extracting AgentRole
	agentRoleResult, err := vm.RunString(` 
							AgentRoleResult = window.fhirpath.evaluate(fhirResource, 'Provenance.agent.role')
							AgentRoleProcessed = AgentRoleResult.reduce((accumulator, currentValue) => {
								if (currentValue.coding) {
									//CodeableConcept
									currentValue.coding.map((coding) => {
										accumulator.push({
											"code": coding.code,	
											"system": coding.system,
											"text": currentValue.text
										})
									})
								} else if (currentValue.value) {
									//ContactPoint, Identifier
									accumulator.push({
										"code": currentValue.value,
										"system": currentValue.system,
										"text": currentValue.type?.text
									})
								} else if (currentValue.code) {
									//Coding
									accumulator.push({
										"code": currentValue.code,
										"system": currentValue.system,
										"text": currentValue.display
									})
								} else if ((typeof currentValue === 'string') || (typeof currentValue === 'boolean')) {
									//string, boolean
									accumulator.push({
										"code": currentValue,
									})
								}
								return accumulator
							}, [])
						
				
							if(AgentRoleProcessed.length == 0) {
								"undefined"
							}
 							else {
								JSON.stringify(AgentRoleProcessed)
							}
						 `)
	if err == nil && agentRoleResult.String() != "undefined" {
		s.AgentRole = []byte(agentRoleResult.String())
	}
	// extracting AgentType
	agentTypeResult, err := vm.RunString(` 
							AgentTypeResult = window.fhirpath.evaluate(fhirResource, 'Provenance.agent.type')
							AgentTypeProcessed = AgentTypeResult.reduce((accumulator, currentValue) => {
								if (currentValue.coding) {
									//CodeableConcept
									currentValue.coding.map((coding) => {
										accumulator.push({
											"code": coding.code,	
											"system": coding.system,
											"text": currentValue.text
										})
									})
								} else if (currentValue.value) {
									//ContactPoint, Identifier
									accumulator.push({
										"code": currentValue.value,
										"system": currentValue.system,
										"text": currentValue.type?.text
									})
								} else if (currentValue.code) {
									//Coding
									accumulator.push({
										"code": currentValue.code,
										"system": currentValue.system,
										"text": currentValue.display
									})
								} else if ((typeof currentValue === 'string') || (typeof currentValue === 'boolean')) {
									//string, boolean
									accumulator.push({
										"code": currentValue,
									})
								}
								return accumulator
							}, [])
						
				
							if(AgentTypeProcessed.length == 0) {
								"undefined"
							}
 							else {
								JSON.stringify(AgentTypeProcessed)
							}
						 `)
	if err == nil && agentTypeResult.String() != "undefined" {
		s.AgentType = []byte(agentTypeResult.String())
	}
	// extracting Entity
	entityResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Provenance.entity.what'))")
	if err == nil && entityResult.String() != "undefined" {
	}
	// extracting Language
	languageResult, err := vm.RunString(` 
							LanguageResult = window.fhirpath.evaluate(fhirResource, 'Resource.language')
							LanguageProcessed = LanguageResult.reduce((accumulator, currentValue) => {
								if (currentValue.coding) {
									//CodeableConcept
									currentValue.coding.map((coding) => {
										accumulator.push({
											"code": coding.code,	
											"system": coding.system,
											"text": currentValue.text
										})
									})
								} else if (currentValue.value) {
									//ContactPoint, Identifier
									accumulator.push({
										"code": currentValue.value,
										"system": currentValue.system,
										"text": currentValue.type?.text
									})
								} else if (currentValue.code) {
									//Coding
									accumulator.push({
										"code": currentValue.code,
										"system": currentValue.system,
										"text": currentValue.display
									})
								} else if ((typeof currentValue === 'string') || (typeof currentValue === 'boolean')) {
									//string, boolean
									accumulator.push({
										"code": currentValue,
									})
								}
								return accumulator
							}, [])
						
				
							if(LanguageProcessed.length == 0) {
								"undefined"
							}
 							else {
								JSON.stringify(LanguageProcessed)
							}
						 `)
	if err == nil && languageResult.String() != "undefined" {
		s.Language = []byte(languageResult.String())
	}
	// extracting LastUpdated
	lastUpdatedResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'Resource.meta.lastUpdated')[0]")
	if err == nil && lastUpdatedResult.String() != "undefined" {
		t, err := time.Parse(time.RFC3339, lastUpdatedResult.String())
		if err == nil {
			s.LastUpdated = &t
		} else if err != nil {
			d, err := time.Parse("2006-01-02", lastUpdatedResult.String())
			if err == nil {
				s.LastUpdated = &d
			}
		}
	}
	// extracting Location
	locationResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Provenance.location'))")
	if err == nil && locationResult.String() != "undefined" {
	}
	// extracting Profile
	profileResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Resource.meta.profile'))")
	if err == nil && profileResult.String() != "undefined" {
	}
	// extracting Recorded
	recordedResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'Provenance.recorded')[0]")
	if err == nil && recordedResult.String() != "undefined" {
		t, err := time.Parse(time.RFC3339, recordedResult.String())
		if err == nil {
			s.Recorded = &t
		} else if err != nil {
			d, err := time.Parse("2006-01-02", recordedResult.String())
			if err == nil {
				s.Recorded = &d
			}
		}
	}
	// extracting SignatureType
	signatureTypeResult, err := vm.RunString(` 
							SignatureTypeResult = window.fhirpath.evaluate(fhirResource, 'Provenance.signature.type')
							SignatureTypeProcessed = SignatureTypeResult.reduce((accumulator, currentValue) => {
								if (currentValue.coding) {
									//CodeableConcept
									currentValue.coding.map((coding) => {
										accumulator.push({
											"code": coding.code,	
											"system": coding.system,
											"text": currentValue.text
										})
									})
								} else if (currentValue.value) {
									//ContactPoint, Identifier
									accumulator.push({
										"code": currentValue.value,
										"system": currentValue.system,
										"text": currentValue.type?.text
									})
								} else if (currentValue.code) {
									//Coding
									accumulator.push({
										"code": currentValue.code,
										"system": currentValue.system,
										"text": currentValue.display
									})
								} else if ((typeof currentValue === 'string') || (typeof currentValue === 'boolean')) {
									//string, boolean
									accumulator.push({
										"code": currentValue,
									})
								}
								return accumulator
							}, [])
						
				
							if(SignatureTypeProcessed.length == 0) {
								"undefined"
							}
 							else {
								JSON.stringify(SignatureTypeProcessed)
							}
						 `)
	if err == nil && signatureTypeResult.String() != "undefined" {
		s.SignatureType = []byte(signatureTypeResult.String())
	}
	// extracting SourceUri
	sourceUriResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'Resource.meta.source')[0]")
	if err == nil && sourceUriResult.String() != "undefined" {
		s.SourceUri = sourceUriResult.String()
	}
	// extracting Tag
	tagResult, err := vm.RunString(` 
							TagResult = window.fhirpath.evaluate(fhirResource, 'Resource.meta.tag')
							TagProcessed = TagResult.reduce((accumulator, currentValue) => {
								if (currentValue.coding) {
									//CodeableConcept
									currentValue.coding.map((coding) => {
										accumulator.push({
											"code": coding.code,	
											"system": coding.system,
											"text": currentValue.text
										})
									})
								} else if (currentValue.value) {
									//ContactPoint, Identifier
									accumulator.push({
										"code": currentValue.value,
										"system": currentValue.system,
										"text": currentValue.type?.text
									})
								} else if (currentValue.code) {
									//Coding
									accumulator.push({
										"code": currentValue.code,
										"system": currentValue.system,
										"text": currentValue.display
									})
								} else if ((typeof currentValue === 'string') || (typeof currentValue === 'boolean')) {
									//string, boolean
									accumulator.push({
										"code": currentValue,
									})
								}
								return accumulator
							}, [])
						
				
							if(TagProcessed.length == 0) {
								"undefined"
							}
 							else {
								JSON.stringify(TagProcessed)
							}
						 `)
	if err == nil && tagResult.String() != "undefined" {
		s.Tag = []byte(tagResult.String())
	}
	// extracting Target
	targetResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Provenance.target'))")
	if err == nil && targetResult.String() != "undefined" {
	}
	// extracting When
	whenResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, '(Provenance.occurredDateTime)')[0]")
	if err == nil && whenResult.String() != "undefined" {
		t, err := time.Parse(time.RFC3339, whenResult.String())
		if err == nil {
			s.When = &t
		} else if err != nil {
			d, err := time.Parse("2006-01-02", whenResult.String())
			if err == nil {
				s.When = &d
			}
		}
	}
	return nil
}

// TableName overrides the table name from fhir_observations (pluralized) to `fhir_observation`. https://gorm.io/docs/conventions.html#TableName
func (s *FhirProvenance) TableName() string {
	return "fhir_provenance"
}
