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

type FhirExplanationOfBenefit struct {
	models.ResourceBase
	// Member of the CareTeam
	// https://hl7.org/fhir/r4/search.html#reference
	CareTeam datatypes.JSON `gorm:"column:careTeam;type:text;serializer:json" json:"careTeam,omitempty"`
	// The reference to the claim
	// https://hl7.org/fhir/r4/search.html#reference
	Claim datatypes.JSON `gorm:"column:claim;type:text;serializer:json" json:"claim,omitempty"`
	// The plan under which the claim was adjudicated
	// https://hl7.org/fhir/r4/search.html#reference
	Coverage datatypes.JSON `gorm:"column:coverage;type:text;serializer:json" json:"coverage,omitempty"`
	// The creation date for the EOB
	// https://hl7.org/fhir/r4/search.html#date
	Created *time.Time `gorm:"column:created;type:datetime" json:"created,omitempty"`
	// UDI associated with a line item detail product or service
	// https://hl7.org/fhir/r4/search.html#reference
	DetailUdi datatypes.JSON `gorm:"column:detailUdi;type:text;serializer:json" json:"detailUdi,omitempty"`
	// The contents of the disposition message
	// https://hl7.org/fhir/r4/search.html#string
	Disposition datatypes.JSON `gorm:"column:disposition;type:text;serializer:json" json:"disposition,omitempty"`
	// Encounters associated with a billed line item
	// https://hl7.org/fhir/r4/search.html#reference
	Encounter datatypes.JSON `gorm:"column:encounter;type:text;serializer:json" json:"encounter,omitempty"`
	// The party responsible for the entry of the Claim
	// https://hl7.org/fhir/r4/search.html#reference
	Enterer datatypes.JSON `gorm:"column:enterer;type:text;serializer:json" json:"enterer,omitempty"`
	// Facility responsible for the goods and services
	// https://hl7.org/fhir/r4/search.html#reference
	Facility datatypes.JSON `gorm:"column:facility;type:text;serializer:json" json:"facility,omitempty"`
	// The business identifier of the Explanation of Benefit
	// https://hl7.org/fhir/r4/search.html#token
	Identifier datatypes.JSON `gorm:"column:identifier;type:text;serializer:json" json:"identifier,omitempty"`
	// UDI associated with a line item product or service
	// https://hl7.org/fhir/r4/search.html#reference
	ItemUdi datatypes.JSON `gorm:"column:itemUdi;type:text;serializer:json" json:"itemUdi,omitempty"`
	// Language of the resource content
	// https://hl7.org/fhir/r4/search.html#token
	Language datatypes.JSON `gorm:"column:language;type:text;serializer:json" json:"language,omitempty"`
	// When the resource version last changed
	// https://hl7.org/fhir/r4/search.html#date
	LastUpdated *time.Time `gorm:"column:lastUpdated;type:datetime" json:"lastUpdated,omitempty"`
	// The party receiving any payment for the Claim
	// https://hl7.org/fhir/r4/search.html#reference
	Payee datatypes.JSON `gorm:"column:payee;type:text;serializer:json" json:"payee,omitempty"`
	// UDI associated with a procedure
	// https://hl7.org/fhir/r4/search.html#reference
	ProcedureUdi datatypes.JSON `gorm:"column:procedureUdi;type:text;serializer:json" json:"procedureUdi,omitempty"`
	// Profiles this resource claims to conform to
	// https://hl7.org/fhir/r4/search.html#reference
	Profile datatypes.JSON `gorm:"column:profile;type:text;serializer:json" json:"profile,omitempty"`
	// The reference to the provider
	// https://hl7.org/fhir/r4/search.html#reference
	Provider datatypes.JSON `gorm:"column:provider;type:text;serializer:json" json:"provider,omitempty"`
	// Status of the instance
	// https://hl7.org/fhir/r4/search.html#token
	Status datatypes.JSON `gorm:"column:status;type:text;serializer:json" json:"status,omitempty"`
	// UDI associated with a line item detail subdetail product or service
	// https://hl7.org/fhir/r4/search.html#reference
	SubdetailUdi datatypes.JSON `gorm:"column:subdetailUdi;type:text;serializer:json" json:"subdetailUdi,omitempty"`
	// Tags applied to this resource
	// https://hl7.org/fhir/r4/search.html#token
	Tag datatypes.JSON `gorm:"column:tag;type:text;serializer:json" json:"tag,omitempty"`
	// Text search against the narrative
	// https://hl7.org/fhir/r4/search.html#string
	Text datatypes.JSON `gorm:"column:text;type:text;serializer:json" json:"text,omitempty"`
	// A resource type filter
	// https://hl7.org/fhir/r4/search.html#special
	Type datatypes.JSON `gorm:"column:type;type:text;serializer:json" json:"type,omitempty"`
}

func (s *FhirExplanationOfBenefit) GetSearchParameters() map[string]string {
	searchParameters := map[string]string{
		"careTeam":     "reference",
		"claim":        "reference",
		"coverage":     "reference",
		"created":      "date",
		"detailUdi":    "reference",
		"disposition":  "string",
		"encounter":    "reference",
		"enterer":      "reference",
		"facility":     "reference",
		"identifier":   "token",
		"itemUdi":      "reference",
		"language":     "token",
		"lastUpdated":  "date",
		"payee":        "reference",
		"procedureUdi": "reference",
		"profile":      "reference",
		"provider":     "reference",
		"status":       "token",
		"subdetailUdi": "reference",
		"tag":          "token",
		"text":         "string",
		"type":         "special",
	}
	return searchParameters
}
func (s *FhirExplanationOfBenefit) PopulateAndExtractSearchParameters(resourceRaw json.RawMessage) error {
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
	// extracting CareTeam
	careTeamResult, err := vm.RunString(` 
							CareTeamResult = window.fhirpath.evaluate(fhirResource, 'ExplanationOfBenefit.careTeam.provider')
						
							if(CareTeamResult.length == 0) {
								"undefined"
							}
 							else {
								JSON.stringify(CareTeamResult)
							}
						 `)
	if err == nil && careTeamResult.String() != "undefined" {
		s.CareTeam = []byte(careTeamResult.String())
	}
	// extracting Claim
	claimResult, err := vm.RunString(` 
							ClaimResult = window.fhirpath.evaluate(fhirResource, 'ExplanationOfBenefit.claim')
						
							if(ClaimResult.length == 0) {
								"undefined"
							}
 							else {
								JSON.stringify(ClaimResult)
							}
						 `)
	if err == nil && claimResult.String() != "undefined" {
		s.Claim = []byte(claimResult.String())
	}
	// extracting Coverage
	coverageResult, err := vm.RunString(` 
							CoverageResult = window.fhirpath.evaluate(fhirResource, 'ExplanationOfBenefit.insurance.coverage')
						
							if(CoverageResult.length == 0) {
								"undefined"
							}
 							else {
								JSON.stringify(CoverageResult)
							}
						 `)
	if err == nil && coverageResult.String() != "undefined" {
		s.Coverage = []byte(coverageResult.String())
	}
	// extracting Created
	createdResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'ExplanationOfBenefit.created')[0]")
	if err == nil && createdResult.String() != "undefined" {
		t, err := time.Parse(time.RFC3339, createdResult.String())
		if err == nil {
			s.Created = &t
		} else if err != nil {
			d, err := time.Parse("2006-01-02", createdResult.String())
			if err == nil {
				s.Created = &d
			}
		}
	}
	// extracting DetailUdi
	detailUdiResult, err := vm.RunString(` 
							DetailUdiResult = window.fhirpath.evaluate(fhirResource, 'ExplanationOfBenefit.item.detail.udi')
						
							if(DetailUdiResult.length == 0) {
								"undefined"
							}
 							else {
								JSON.stringify(DetailUdiResult)
							}
						 `)
	if err == nil && detailUdiResult.String() != "undefined" {
		s.DetailUdi = []byte(detailUdiResult.String())
	}
	// extracting Disposition
	dispositionResult, err := vm.RunString(` 
							DispositionResult = window.fhirpath.evaluate(fhirResource, 'ExplanationOfBenefit.disposition')
							DispositionProcessed = DispositionResult.reduce((accumulator, currentValue) => {
								if (typeof currentValue === 'string') {
									//basic string
									accumulator.push(currentValue)
								} else if (currentValue.family  || currentValue.given) {
									//HumanName http://hl7.org/fhir/R4/datatypes.html#HumanName
									var humanNameParts = []
									if (currentValue.prefix) {
										humanNameParts = humanNameParts.concat(currentValue.prefix)
									}
									if (currentValue.given) {	
										humanNameParts = humanNameParts.concat(currentValue.given)
									}	
									if (currentValue.family) {	
										humanNameParts.push(currentValue.family)	
									}	
									if (currentValue.suffix) {	
										humanNameParts = humanNameParts.concat(currentValue.suffix)	
									}
									accumulator.push(humanNameParts.join(" "))
								} else if (currentValue.city || currentValue.state || currentValue.country || currentValue.postalCode) {
									//Address http://hl7.org/fhir/R4/datatypes.html#Address
									var addressParts = []		
									if (currentValue.line) {
										addressParts = addressParts.concat(currentValue.line)
									}
									if (currentValue.city) {
										addressParts.push(currentValue.city)
									}	
									if (currentValue.state) {	
										addressParts.push(currentValue.state)
									}	
									if (currentValue.postalCode) {
										addressParts.push(currentValue.postalCode)
									}	
									if (currentValue.country) {
										addressParts.push(currentValue.country)	
									}	
									accumulator.push(addressParts.join(" "))
								} else {
									//string, boolean
									accumulator.push(currentValue)
								}
								return accumulator
							}, [])
						
							if(DispositionProcessed.length == 0) {
								"undefined"
							}
 							else {
								JSON.stringify(DispositionProcessed)
							}
						 `)
	if err == nil && dispositionResult.String() != "undefined" {
		s.Disposition = []byte(dispositionResult.String())
	}
	// extracting Encounter
	encounterResult, err := vm.RunString(` 
							EncounterResult = window.fhirpath.evaluate(fhirResource, 'ExplanationOfBenefit.item.encounter')
						
							if(EncounterResult.length == 0) {
								"undefined"
							}
 							else {
								JSON.stringify(EncounterResult)
							}
						 `)
	if err == nil && encounterResult.String() != "undefined" {
		s.Encounter = []byte(encounterResult.String())
	}
	// extracting Enterer
	entererResult, err := vm.RunString(` 
							EntererResult = window.fhirpath.evaluate(fhirResource, 'ExplanationOfBenefit.enterer')
						
							if(EntererResult.length == 0) {
								"undefined"
							}
 							else {
								JSON.stringify(EntererResult)
							}
						 `)
	if err == nil && entererResult.String() != "undefined" {
		s.Enterer = []byte(entererResult.String())
	}
	// extracting Facility
	facilityResult, err := vm.RunString(` 
							FacilityResult = window.fhirpath.evaluate(fhirResource, 'ExplanationOfBenefit.facility')
						
							if(FacilityResult.length == 0) {
								"undefined"
							}
 							else {
								JSON.stringify(FacilityResult)
							}
						 `)
	if err == nil && facilityResult.String() != "undefined" {
		s.Facility = []byte(facilityResult.String())
	}
	// extracting Identifier
	identifierResult, err := vm.RunString(` 
							IdentifierResult = window.fhirpath.evaluate(fhirResource, 'ExplanationOfBenefit.identifier')
							IdentifierProcessed = IdentifierResult.reduce((accumulator, currentValue) => {
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
						
				
							if(IdentifierProcessed.length == 0) {
								"undefined"
							}
 							else {
								JSON.stringify(IdentifierProcessed)
							}
						 `)
	if err == nil && identifierResult.String() != "undefined" {
		s.Identifier = []byte(identifierResult.String())
	}
	// extracting ItemUdi
	itemUdiResult, err := vm.RunString(` 
							ItemUdiResult = window.fhirpath.evaluate(fhirResource, 'ExplanationOfBenefit.item.udi')
						
							if(ItemUdiResult.length == 0) {
								"undefined"
							}
 							else {
								JSON.stringify(ItemUdiResult)
							}
						 `)
	if err == nil && itemUdiResult.String() != "undefined" {
		s.ItemUdi = []byte(itemUdiResult.String())
	}
	// extracting Language
	languageResult, err := vm.RunString(` 
							LanguageResult = window.fhirpath.evaluate(fhirResource, 'language')
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
	lastUpdatedResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'meta.lastUpdated')[0]")
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
	// extracting Payee
	payeeResult, err := vm.RunString(` 
							PayeeResult = window.fhirpath.evaluate(fhirResource, 'ExplanationOfBenefit.payee.party')
						
							if(PayeeResult.length == 0) {
								"undefined"
							}
 							else {
								JSON.stringify(PayeeResult)
							}
						 `)
	if err == nil && payeeResult.String() != "undefined" {
		s.Payee = []byte(payeeResult.String())
	}
	// extracting ProcedureUdi
	procedureUdiResult, err := vm.RunString(` 
							ProcedureUdiResult = window.fhirpath.evaluate(fhirResource, 'ExplanationOfBenefit.procedure.udi')
						
							if(ProcedureUdiResult.length == 0) {
								"undefined"
							}
 							else {
								JSON.stringify(ProcedureUdiResult)
							}
						 `)
	if err == nil && procedureUdiResult.String() != "undefined" {
		s.ProcedureUdi = []byte(procedureUdiResult.String())
	}
	// extracting Profile
	profileResult, err := vm.RunString(` 
							ProfileResult = window.fhirpath.evaluate(fhirResource, 'meta.profile')
						
							if(ProfileResult.length == 0) {
								"undefined"
							}
 							else {
								JSON.stringify(ProfileResult)
							}
						 `)
	if err == nil && profileResult.String() != "undefined" {
		s.Profile = []byte(profileResult.String())
	}
	// extracting Provider
	providerResult, err := vm.RunString(` 
							ProviderResult = window.fhirpath.evaluate(fhirResource, 'ExplanationOfBenefit.provider')
						
							if(ProviderResult.length == 0) {
								"undefined"
							}
 							else {
								JSON.stringify(ProviderResult)
							}
						 `)
	if err == nil && providerResult.String() != "undefined" {
		s.Provider = []byte(providerResult.String())
	}
	// extracting Status
	statusResult, err := vm.RunString(` 
							StatusResult = window.fhirpath.evaluate(fhirResource, 'ExplanationOfBenefit.status')
							StatusProcessed = StatusResult.reduce((accumulator, currentValue) => {
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
						
				
							if(StatusProcessed.length == 0) {
								"undefined"
							}
 							else {
								JSON.stringify(StatusProcessed)
							}
						 `)
	if err == nil && statusResult.String() != "undefined" {
		s.Status = []byte(statusResult.String())
	}
	// extracting SubdetailUdi
	subdetailUdiResult, err := vm.RunString(` 
							SubdetailUdiResult = window.fhirpath.evaluate(fhirResource, 'ExplanationOfBenefit.item.detail.subDetail.udi')
						
							if(SubdetailUdiResult.length == 0) {
								"undefined"
							}
 							else {
								JSON.stringify(SubdetailUdiResult)
							}
						 `)
	if err == nil && subdetailUdiResult.String() != "undefined" {
		s.SubdetailUdi = []byte(subdetailUdiResult.String())
	}
	// extracting Tag
	tagResult, err := vm.RunString(` 
							TagResult = window.fhirpath.evaluate(fhirResource, 'meta.tag')
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
	return nil
}

// TableName overrides the table name from fhir_observations (pluralized) to `fhir_observation`. https://gorm.io/docs/conventions.html#TableName
func (s *FhirExplanationOfBenefit) TableName() string {
	return "fhir_explanation_of_benefit"
}
