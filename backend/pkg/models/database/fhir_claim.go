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

type FhirClaim struct {
	models.OriginBase
	// Member of the CareTeam
	// https://hl7.org/fhir/r4/search.html#reference
	CareTeam datatypes.JSON `gorm:"column:careTeam;type:text;serializer:json" json:"careTeam,omitempty"`
	// The creation date for the Claim
	// https://hl7.org/fhir/r4/search.html#date
	Created time.Time `gorm:"column:created;type:datetime" json:"created,omitempty"`
	// UDI associated with a line item, detail product or service
	// https://hl7.org/fhir/r4/search.html#reference
	DetailUdi datatypes.JSON `gorm:"column:detailUdi;type:text;serializer:json" json:"detailUdi,omitempty"`
	// Encounters associated with a billed line item
	// https://hl7.org/fhir/r4/search.html#reference
	Encounter datatypes.JSON `gorm:"column:encounter;type:text;serializer:json" json:"encounter,omitempty"`
	// The party responsible for the entry of the Claim
	// https://hl7.org/fhir/r4/search.html#reference
	Enterer datatypes.JSON `gorm:"column:enterer;type:text;serializer:json" json:"enterer,omitempty"`
	// Facility where the products or services have been or will be provided
	// https://hl7.org/fhir/r4/search.html#reference
	Facility datatypes.JSON `gorm:"column:facility;type:text;serializer:json" json:"facility,omitempty"`
	// The primary identifier of the financial resource
	// https://hl7.org/fhir/r4/search.html#token
	Identifier datatypes.JSON `gorm:"column:identifier;type:text;serializer:json" json:"identifier,omitempty"`
	// The target payor/insurer for the Claim
	// https://hl7.org/fhir/r4/search.html#reference
	Insurer datatypes.JSON `gorm:"column:insurer;type:text;serializer:json" json:"insurer,omitempty"`
	// UDI associated with a line item product or service
	// https://hl7.org/fhir/r4/search.html#reference
	ItemUdi datatypes.JSON `gorm:"column:itemUdi;type:text;serializer:json" json:"itemUdi,omitempty"`
	// Language of the resource content
	// https://hl7.org/fhir/r4/search.html#token
	Language datatypes.JSON `gorm:"column:language;type:text;serializer:json" json:"language,omitempty"`
	// When the resource version last changed
	// https://hl7.org/fhir/r4/search.html#date
	LastUpdated time.Time `gorm:"column:lastUpdated;type:datetime" json:"lastUpdated,omitempty"`
	// The party receiving any payment for the Claim
	// https://hl7.org/fhir/r4/search.html#reference
	Payee datatypes.JSON `gorm:"column:payee;type:text;serializer:json" json:"payee,omitempty"`
	// Processing priority requested
	// https://hl7.org/fhir/r4/search.html#token
	Priority datatypes.JSON `gorm:"column:priority;type:text;serializer:json" json:"priority,omitempty"`
	// UDI associated with a procedure
	// https://hl7.org/fhir/r4/search.html#reference
	ProcedureUdi datatypes.JSON `gorm:"column:procedureUdi;type:text;serializer:json" json:"procedureUdi,omitempty"`
	// Profiles this resource claims to conform to
	// https://hl7.org/fhir/r4/search.html#reference
	Profile datatypes.JSON `gorm:"column:profile;type:text;serializer:json" json:"profile,omitempty"`
	// Provider responsible for the Claim
	// https://hl7.org/fhir/r4/search.html#reference
	Provider datatypes.JSON `gorm:"column:provider;type:text;serializer:json" json:"provider,omitempty"`
	// The raw resource content in JSON format
	// https://hl7.org/fhir/r4/search.html#special
	RawResource datatypes.JSON `gorm:"column:rawResource;type:text;serializer:json" json:"rawResource,omitempty"`
	// Identifies where the resource comes from
	// https://hl7.org/fhir/r4/search.html#uri
	SourceUri string `gorm:"column:sourceUri;type:text" json:"sourceUri,omitempty"`
	// The status of the Claim instance.
	// https://hl7.org/fhir/r4/search.html#token
	Status datatypes.JSON `gorm:"column:status;type:text;serializer:json" json:"status,omitempty"`
	// UDI associated with a line item, detail, subdetail product or service
	// https://hl7.org/fhir/r4/search.html#reference
	SubdetailUdi datatypes.JSON `gorm:"column:subdetailUdi;type:text;serializer:json" json:"subdetailUdi,omitempty"`
	// Tags applied to this resource
	// https://hl7.org/fhir/r4/search.html#token
	Tag datatypes.JSON `gorm:"column:tag;type:text;serializer:json" json:"tag,omitempty"`
	// Text search against the narrative
	// https://hl7.org/fhir/r4/search.html#string
	Text string `gorm:"column:text;type:text" json:"text,omitempty"`
	// A resource type filter
	// https://hl7.org/fhir/r4/search.html#special
	Type datatypes.JSON `gorm:"column:type;type:text;serializer:json" json:"type,omitempty"`
	// The kind of financial resource
	// https://hl7.org/fhir/r4/search.html#token
	Use datatypes.JSON `gorm:"column:use;type:text;serializer:json" json:"use,omitempty"`
}

func (s *FhirClaim) SetOriginBase(originBase models.OriginBase) {
	s.OriginBase = originBase
}
func (s *FhirClaim) GetSearchParameters() map[string]string {
	searchParameters := map[string]string{
		"careTeam":     "reference",
		"created":      "date",
		"detailUdi":    "reference",
		"encounter":    "reference",
		"enterer":      "reference",
		"facility":     "reference",
		"identifier":   "token",
		"insurer":      "reference",
		"itemUdi":      "reference",
		"language":     "token",
		"lastUpdated":  "date",
		"payee":        "reference",
		"priority":     "token",
		"procedureUdi": "reference",
		"profile":      "reference",
		"provider":     "reference",
		"rawResource":  "special",
		"sourceUri":    "uri",
		"status":       "token",
		"subdetailUdi": "reference",
		"tag":          "token",
		"text":         "string",
		"type":         "special",
		"use":          "token",
	}
	return searchParameters
}
func (s *FhirClaim) PopulateAndExtractSearchParameters(rawResource json.RawMessage) error {
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
	// extracting CareTeam
	careTeamResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Claim.careTeam.provider'))")
	if err == nil && careTeamResult.String() != "undefined" {
		s.CareTeam = []byte(careTeamResult.String())
	}
	// extracting Created
	createdResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'Claim.created')[0]")
	if err == nil && createdResult.String() != "undefined" {
		t, err := time.Parse(time.RFC3339, createdResult.String())
		if err == nil {
			s.Created = t
		}
	}
	// extracting DetailUdi
	detailUdiResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Claim.item.detail.udi'))")
	if err == nil && detailUdiResult.String() != "undefined" {
		s.DetailUdi = []byte(detailUdiResult.String())
	}
	// extracting Encounter
	encounterResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Claim.item.encounter'))")
	if err == nil && encounterResult.String() != "undefined" {
		s.Encounter = []byte(encounterResult.String())
	}
	// extracting Enterer
	entererResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Claim.enterer'))")
	if err == nil && entererResult.String() != "undefined" {
		s.Enterer = []byte(entererResult.String())
	}
	// extracting Facility
	facilityResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Claim.facility'))")
	if err == nil && facilityResult.String() != "undefined" {
		s.Facility = []byte(facilityResult.String())
	}
	// extracting Identifier
	identifierResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Claim.identifier'))")
	if err == nil && identifierResult.String() != "undefined" {
		s.Identifier = []byte(identifierResult.String())
	}
	// extracting Insurer
	insurerResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Claim.insurer'))")
	if err == nil && insurerResult.String() != "undefined" {
		s.Insurer = []byte(insurerResult.String())
	}
	// extracting ItemUdi
	itemUdiResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Claim.item.udi'))")
	if err == nil && itemUdiResult.String() != "undefined" {
		s.ItemUdi = []byte(itemUdiResult.String())
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
	// extracting Payee
	payeeResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Claim.payee.party'))")
	if err == nil && payeeResult.String() != "undefined" {
		s.Payee = []byte(payeeResult.String())
	}
	// extracting Priority
	priorityResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Claim.priority'))")
	if err == nil && priorityResult.String() != "undefined" {
		s.Priority = []byte(priorityResult.String())
	}
	// extracting ProcedureUdi
	procedureUdiResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Claim.procedure.udi'))")
	if err == nil && procedureUdiResult.String() != "undefined" {
		s.ProcedureUdi = []byte(procedureUdiResult.String())
	}
	// extracting Profile
	profileResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Resource.meta.profile'))")
	if err == nil && profileResult.String() != "undefined" {
		s.Profile = []byte(profileResult.String())
	}
	// extracting Provider
	providerResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Claim.provider'))")
	if err == nil && providerResult.String() != "undefined" {
		s.Provider = []byte(providerResult.String())
	}
	// extracting SourceUri
	sourceUriResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'Resource.meta.source')[0]")
	if err == nil && sourceUriResult.String() != "undefined" {
		s.SourceUri = sourceUriResult.String()
	}
	// extracting Status
	statusResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Claim.status'))")
	if err == nil && statusResult.String() != "undefined" {
		s.Status = []byte(statusResult.String())
	}
	// extracting SubdetailUdi
	subdetailUdiResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Claim.item.detail.subDetail.udi'))")
	if err == nil && subdetailUdiResult.String() != "undefined" {
		s.SubdetailUdi = []byte(subdetailUdiResult.String())
	}
	// extracting Tag
	tagResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Resource.meta.tag'))")
	if err == nil && tagResult.String() != "undefined" {
		s.Tag = []byte(tagResult.String())
	}
	// extracting Use
	useResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Claim.use'))")
	if err == nil && useResult.String() != "undefined" {
		s.Use = []byte(useResult.String())
	}
	return nil
}

// TableName overrides the table name from fhir_observations (pluralized) to `fhir_observation`. https://gorm.io/docs/conventions.html#TableName
func (s *FhirClaim) TableName() string {
	return "fhir_claim"
}