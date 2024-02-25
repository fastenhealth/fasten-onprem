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
	// The party receiving any payment for the Claim
	// https://hl7.org/fhir/r4/search.html#reference
	Payee datatypes.JSON `gorm:"column:payee;type:text;serializer:json" json:"payee,omitempty"`
	// UDI associated with a procedure
	// https://hl7.org/fhir/r4/search.html#reference
	ProcedureUdi datatypes.JSON `gorm:"column:procedureUdi;type:text;serializer:json" json:"procedureUdi,omitempty"`
	// The reference to the provider
	// https://hl7.org/fhir/r4/search.html#reference
	Provider datatypes.JSON `gorm:"column:provider;type:text;serializer:json" json:"provider,omitempty"`
	// Status of the instance
	// https://hl7.org/fhir/r4/search.html#token
	Status datatypes.JSON `gorm:"column:status;type:text;serializer:json" json:"status,omitempty"`
	// UDI associated with a line item detail subdetail product or service
	// https://hl7.org/fhir/r4/search.html#reference
	SubdetailUdi datatypes.JSON `gorm:"column:subdetailUdi;type:text;serializer:json" json:"subdetailUdi,omitempty"`
	// Text search against the narrative
	// This is a primitive string literal (`keyword` type). It is not a recognized SearchParameter type from https://hl7.org/fhir/r4/search.html, it's Fasten Health-specific
	Text string `gorm:"column:text;type:text" json:"text,omitempty"`
	// A resource type filter
	// https://hl7.org/fhir/r4/search.html#special
	Type datatypes.JSON `gorm:"column:type;type:text;serializer:json" json:"type,omitempty"`
}

func (s *FhirExplanationOfBenefit) GetSearchParameters() map[string]string {
	searchParameters := map[string]string{
		"careTeam":             "reference",
		"claim":                "reference",
		"coverage":             "reference",
		"created":              "date",
		"detailUdi":            "reference",
		"disposition":          "string",
		"encounter":            "reference",
		"enterer":              "reference",
		"facility":             "reference",
		"id":                   "keyword",
		"identifier":           "token",
		"itemUdi":              "reference",
		"language":             "token",
		"metaLastUpdated":      "date",
		"metaProfile":          "reference",
		"metaTag":              "token",
		"metaVersionId":        "keyword",
		"payee":                "reference",
		"procedureUdi":         "reference",
		"provider":             "reference",
		"sort_date":            "date",
		"source_id":            "keyword",
		"source_resource_id":   "keyword",
		"source_resource_type": "keyword",
		"source_uri":           "keyword",
		"status":               "token",
		"subdetailUdi":         "reference",
		"text":                 "keyword",
		"type":                 "special",
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
	// extracting CareTeam
	careTeamResult, err := vm.RunString("extractReferenceSearchParameters(fhirResource, 'ExplanationOfBenefit.careTeam.provider')")
	if err == nil && careTeamResult.String() != "undefined" {
		s.CareTeam = []byte(careTeamResult.String())
	}
	// extracting Claim
	claimResult, err := vm.RunString("extractReferenceSearchParameters(fhirResource, 'ExplanationOfBenefit.claim')")
	if err == nil && claimResult.String() != "undefined" {
		s.Claim = []byte(claimResult.String())
	}
	// extracting Coverage
	coverageResult, err := vm.RunString("extractReferenceSearchParameters(fhirResource, 'ExplanationOfBenefit.insurance.coverage')")
	if err == nil && coverageResult.String() != "undefined" {
		s.Coverage = []byte(coverageResult.String())
	}
	// extracting Created
	createdResult, err := vm.RunString("extractDateSearchParameters(fhirResource, 'ExplanationOfBenefit.created')")
	if err == nil && createdResult.String() != "undefined" {
		if t, err := time.Parse(time.RFC3339, createdResult.String()); err == nil {
			s.Created = &t
		} else if t, err = time.Parse("2006-01-02", createdResult.String()); err == nil {
			s.Created = &t
		} else if t, err = time.Parse("2006-01", createdResult.String()); err == nil {
			s.Created = &t
		} else if t, err = time.Parse("2006", createdResult.String()); err == nil {
			s.Created = &t
		}
	}
	// extracting DetailUdi
	detailUdiResult, err := vm.RunString("extractReferenceSearchParameters(fhirResource, 'ExplanationOfBenefit.item.detail.udi')")
	if err == nil && detailUdiResult.String() != "undefined" {
		s.DetailUdi = []byte(detailUdiResult.String())
	}
	// extracting Disposition
	dispositionResult, err := vm.RunString("extractStringSearchParameters(fhirResource, 'ExplanationOfBenefit.disposition')")
	if err == nil && dispositionResult.String() != "undefined" {
		s.Disposition = []byte(dispositionResult.String())
	}
	// extracting Encounter
	encounterResult, err := vm.RunString("extractReferenceSearchParameters(fhirResource, 'ExplanationOfBenefit.item.encounter')")
	if err == nil && encounterResult.String() != "undefined" {
		s.Encounter = []byte(encounterResult.String())
	}
	// extracting Enterer
	entererResult, err := vm.RunString("extractReferenceSearchParameters(fhirResource, 'ExplanationOfBenefit.enterer')")
	if err == nil && entererResult.String() != "undefined" {
		s.Enterer = []byte(entererResult.String())
	}
	// extracting Facility
	facilityResult, err := vm.RunString("extractReferenceSearchParameters(fhirResource, 'ExplanationOfBenefit.facility')")
	if err == nil && facilityResult.String() != "undefined" {
		s.Facility = []byte(facilityResult.String())
	}
	// extracting Identifier
	identifierResult, err := vm.RunString("extractTokenSearchParameters(fhirResource, 'ExplanationOfBenefit.identifier')")
	if err == nil && identifierResult.String() != "undefined" {
		s.Identifier = []byte(identifierResult.String())
	}
	// extracting ItemUdi
	itemUdiResult, err := vm.RunString("extractReferenceSearchParameters(fhirResource, 'ExplanationOfBenefit.item.udi')")
	if err == nil && itemUdiResult.String() != "undefined" {
		s.ItemUdi = []byte(itemUdiResult.String())
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
	// extracting Payee
	payeeResult, err := vm.RunString("extractReferenceSearchParameters(fhirResource, 'ExplanationOfBenefit.payee.party')")
	if err == nil && payeeResult.String() != "undefined" {
		s.Payee = []byte(payeeResult.String())
	}
	// extracting ProcedureUdi
	procedureUdiResult, err := vm.RunString("extractReferenceSearchParameters(fhirResource, 'ExplanationOfBenefit.procedure.udi')")
	if err == nil && procedureUdiResult.String() != "undefined" {
		s.ProcedureUdi = []byte(procedureUdiResult.String())
	}
	// extracting Provider
	providerResult, err := vm.RunString("extractReferenceSearchParameters(fhirResource, 'ExplanationOfBenefit.provider')")
	if err == nil && providerResult.String() != "undefined" {
		s.Provider = []byte(providerResult.String())
	}
	// extracting Status
	statusResult, err := vm.RunString("extractTokenSearchParameters(fhirResource, 'ExplanationOfBenefit.status')")
	if err == nil && statusResult.String() != "undefined" {
		s.Status = []byte(statusResult.String())
	}
	// extracting SubdetailUdi
	subdetailUdiResult, err := vm.RunString("extractReferenceSearchParameters(fhirResource, 'ExplanationOfBenefit.item.detail.subDetail.udi')")
	if err == nil && subdetailUdiResult.String() != "undefined" {
		s.SubdetailUdi = []byte(subdetailUdiResult.String())
	}
	// extracting Text
	textResult, err := vm.RunString("extractSimpleSearchParameters(fhirResource, 'text')")
	if err == nil && textResult.String() != "undefined" {
		s.Text = textResult.String()
	}
	return nil
}

// TableName overrides the table name from fhir_observations (pluralized) to `fhir_observation`. https://gorm.io/docs/conventions.html#TableName
func (s *FhirExplanationOfBenefit) TableName() string {
	return "fhir_explanation_of_benefit"
}
