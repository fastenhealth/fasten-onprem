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

type FhirNutritionOrder struct {
	models.ResourceBase
	// Type of module component to add to the feeding
	// https://hl7.org/fhir/r4/search.html#token
	Additive datatypes.JSON `gorm:"column:additive;type:text;serializer:json" json:"additive,omitempty"`
	// Return nutrition orders requested on this date
	// https://hl7.org/fhir/r4/search.html#date
	Datetime *time.Time `gorm:"column:datetime;type:datetime" json:"datetime,omitempty"`
	/*
	   Multiple Resources:

	   * [Composition](composition.html): Context of the Composition
	   * [DeviceRequest](devicerequest.html): Encounter during which request was created
	   * [DiagnosticReport](diagnosticreport.html): The Encounter when the order was made
	   * [DocumentReference](documentreference.html): Context of the document  content
	   * [Flag](flag.html): Alert relevant during encounter
	   * [List](list.html): Context in which list created
	   * [NutritionOrder](nutritionorder.html): Return nutrition orders with this encounter identifier
	   * [Observation](observation.html): Encounter related to the observation
	   * [Procedure](procedure.html): Encounter created as part of
	   * [RiskAssessment](riskassessment.html): Where was assessment performed?
	   * [ServiceRequest](servicerequest.html): An encounter in which this request is made
	   * [VisionPrescription](visionprescription.html): Return prescriptions with this encounter identifier
	*/
	// https://hl7.org/fhir/r4/search.html#reference
	Encounter datatypes.JSON `gorm:"column:encounter;type:text;serializer:json" json:"encounter,omitempty"`
	// Type of enteral or infant formula
	// https://hl7.org/fhir/r4/search.html#token
	Formula datatypes.JSON `gorm:"column:formula;type:text;serializer:json" json:"formula,omitempty"`
	/*
	   Multiple Resources:

	   * [AllergyIntolerance](allergyintolerance.html): External ids for this item
	   * [CarePlan](careplan.html): External Ids for this plan
	   * [CareTeam](careteam.html): External Ids for this team
	   * [Composition](composition.html): Version-independent identifier for the Composition
	   * [Condition](condition.html): A unique identifier of the condition record
	   * [Consent](consent.html): Identifier for this record (external references)
	   * [DetectedIssue](detectedissue.html): Unique id for the detected issue
	   * [DeviceRequest](devicerequest.html): Business identifier for request/order
	   * [DiagnosticReport](diagnosticreport.html): An identifier for the report
	   * [DocumentManifest](documentmanifest.html): Unique Identifier for the set of documents
	   * [DocumentReference](documentreference.html): Master Version Specific Identifier
	   * [Encounter](encounter.html): Identifier(s) by which this encounter is known
	   * [EpisodeOfCare](episodeofcare.html): Business Identifier(s) relevant for this EpisodeOfCare
	   * [FamilyMemberHistory](familymemberhistory.html): A search by a record identifier
	   * [Goal](goal.html): External Ids for this goal
	   * [ImagingStudy](imagingstudy.html): Identifiers for the Study, such as DICOM Study Instance UID and Accession number
	   * [Immunization](immunization.html): Business identifier
	   * [List](list.html): Business identifier
	   * [MedicationAdministration](medicationadministration.html): Return administrations with this external identifier
	   * [MedicationDispense](medicationdispense.html): Returns dispenses with this external identifier
	   * [MedicationRequest](medicationrequest.html): Return prescriptions with this external identifier
	   * [MedicationStatement](medicationstatement.html): Return statements with this external identifier
	   * [NutritionOrder](nutritionorder.html): Return nutrition orders with this external identifier
	   * [Observation](observation.html): The unique id for a particular observation
	   * [Procedure](procedure.html): A unique identifier for a procedure
	   * [RiskAssessment](riskassessment.html): Unique identifier for the assessment
	   * [ServiceRequest](servicerequest.html): Identifiers assigned to this order
	   * [SupplyDelivery](supplydelivery.html): External identifier
	   * [SupplyRequest](supplyrequest.html): Business Identifier for SupplyRequest
	   * [VisionPrescription](visionprescription.html): Return prescriptions with this external identifier
	*/
	// https://hl7.org/fhir/r4/search.html#token
	Identifier datatypes.JSON `gorm:"column:identifier;type:text;serializer:json" json:"identifier,omitempty"`
	// Instantiates FHIR protocol or definition
	// https://hl7.org/fhir/r4/search.html#reference
	InstantiatesCanonical datatypes.JSON `gorm:"column:instantiatesCanonical;type:text;serializer:json" json:"instantiatesCanonical,omitempty"`
	// Instantiates external protocol or definition
	// https://hl7.org/fhir/r4/search.html#uri
	InstantiatesUri string `gorm:"column:instantiatesUri;type:text" json:"instantiatesUri,omitempty"`
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
	// Type of diet that can be consumed orally (i.e., take via the mouth).
	// https://hl7.org/fhir/r4/search.html#token
	Oraldiet datatypes.JSON `gorm:"column:oraldiet;type:text;serializer:json" json:"oraldiet,omitempty"`
	// The identity of the provider who placed the nutrition order
	// https://hl7.org/fhir/r4/search.html#reference
	Provider datatypes.JSON `gorm:"column:provider;type:text;serializer:json" json:"provider,omitempty"`
	// Status of the nutrition order.
	// https://hl7.org/fhir/r4/search.html#token
	Status datatypes.JSON `gorm:"column:status;type:text;serializer:json" json:"status,omitempty"`
	// Type of supplement product requested
	// https://hl7.org/fhir/r4/search.html#token
	Supplement datatypes.JSON `gorm:"column:supplement;type:text;serializer:json" json:"supplement,omitempty"`
	// Text search against the narrative
	// This is a primitive string literal (`keyword` type). It is not a recognized SearchParameter type from https://hl7.org/fhir/r4/search.html, it's Fasten Health-specific
	Text string `gorm:"column:text;type:text" json:"text,omitempty"`
	// A resource type filter
	// https://hl7.org/fhir/r4/search.html#special
	Type datatypes.JSON `gorm:"column:type;type:text;serializer:json" json:"type,omitempty"`
}

func (s *FhirNutritionOrder) GetSearchParameters() map[string]string {
	searchParameters := map[string]string{
		"additive":              "token",
		"datetime":              "date",
		"encounter":             "reference",
		"formula":               "token",
		"id":                    "keyword",
		"identifier":            "token",
		"instantiatesCanonical": "reference",
		"instantiatesUri":       "uri",
		"language":              "token",
		"metaLastUpdated":       "date",
		"metaProfile":           "reference",
		"metaTag":               "token",
		"metaVersionId":         "keyword",
		"oraldiet":              "token",
		"provider":              "reference",
		"sort_date":             "date",
		"source_id":             "keyword",
		"source_resource_id":    "keyword",
		"source_resource_type":  "keyword",
		"source_uri":            "keyword",
		"status":                "token",
		"supplement":            "token",
		"text":                  "keyword",
		"type":                  "special",
	}
	return searchParameters
}
func (s *FhirNutritionOrder) PopulateAndExtractSearchParameters(resourceRaw json.RawMessage) error {
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
	// extracting Additive
	additiveResult, err := vm.RunString("extractTokenSearchParameters(fhirResource, 'NutritionOrder.enteralFormula.additiveType')")
	if err == nil && additiveResult.String() != "undefined" {
		s.Additive = []byte(additiveResult.String())
	}
	// extracting Datetime
	datetimeResult, err := vm.RunString("extractDateSearchParameters(fhirResource, 'NutritionOrder.dateTime')")
	if err == nil && datetimeResult.String() != "undefined" {
		if t, err := time.Parse(time.RFC3339, datetimeResult.String()); err == nil {
			s.Datetime = &t
		} else if t, err = time.Parse("2006-01-02", datetimeResult.String()); err == nil {
			s.Datetime = &t
		} else if t, err = time.Parse("2006-01", datetimeResult.String()); err == nil {
			s.Datetime = &t
		} else if t, err = time.Parse("2006", datetimeResult.String()); err == nil {
			s.Datetime = &t
		}
	}
	// extracting Encounter
	encounterResult, err := vm.RunString("extractReferenceSearchParameters(fhirResource, 'Composition.encounter | DeviceRequest.encounter | DiagnosticReport.encounter | DocumentReference.context.encounter.where(resolve() is Encounter) | Flag.encounter | List.encounter | NutritionOrder.encounter | Observation.encounter | Procedure.encounter | RiskAssessment.encounter | ServiceRequest.encounter | VisionPrescription.encounter')")
	if err == nil && encounterResult.String() != "undefined" {
		s.Encounter = []byte(encounterResult.String())
	}
	// extracting Formula
	formulaResult, err := vm.RunString("extractTokenSearchParameters(fhirResource, 'NutritionOrder.enteralFormula.baseFormulaType')")
	if err == nil && formulaResult.String() != "undefined" {
		s.Formula = []byte(formulaResult.String())
	}
	// extracting Identifier
	identifierResult, err := vm.RunString("extractTokenSearchParameters(fhirResource, 'AllergyIntolerance.identifier | CarePlan.identifier | CareTeam.identifier | Composition.identifier | Condition.identifier | Consent.identifier | DetectedIssue.identifier | DeviceRequest.identifier | DiagnosticReport.identifier | DocumentManifest.masterIdentifier | DocumentManifest.identifier | DocumentReference.masterIdentifier | DocumentReference.identifier | Encounter.identifier | EpisodeOfCare.identifier | FamilyMemberHistory.identifier | Goal.identifier | ImagingStudy.identifier | Immunization.identifier | List.identifier | MedicationAdministration.identifier | MedicationDispense.identifier | MedicationRequest.identifier | MedicationStatement.identifier | NutritionOrder.identifier | Observation.identifier | Procedure.identifier | RiskAssessment.identifier | ServiceRequest.identifier | SupplyDelivery.identifier | SupplyRequest.identifier | VisionPrescription.identifier')")
	if err == nil && identifierResult.String() != "undefined" {
		s.Identifier = []byte(identifierResult.String())
	}
	// extracting InstantiatesCanonical
	instantiatesCanonicalResult, err := vm.RunString("extractReferenceSearchParameters(fhirResource, 'NutritionOrder.instantiatesCanonical')")
	if err == nil && instantiatesCanonicalResult.String() != "undefined" {
		s.InstantiatesCanonical = []byte(instantiatesCanonicalResult.String())
	}
	// extracting InstantiatesUri
	instantiatesUriResult, err := vm.RunString("extractSimpleSearchParameters(fhirResource, 'NutritionOrder.instantiatesUri')")
	if err == nil && instantiatesUriResult.String() != "undefined" {
		s.InstantiatesUri = instantiatesUriResult.String()
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
	// extracting Oraldiet
	oraldietResult, err := vm.RunString("extractTokenSearchParameters(fhirResource, 'NutritionOrder.oralDiet.type')")
	if err == nil && oraldietResult.String() != "undefined" {
		s.Oraldiet = []byte(oraldietResult.String())
	}
	// extracting Provider
	providerResult, err := vm.RunString("extractReferenceSearchParameters(fhirResource, 'NutritionOrder.orderer')")
	if err == nil && providerResult.String() != "undefined" {
		s.Provider = []byte(providerResult.String())
	}
	// extracting Status
	statusResult, err := vm.RunString("extractTokenSearchParameters(fhirResource, 'NutritionOrder.status')")
	if err == nil && statusResult.String() != "undefined" {
		s.Status = []byte(statusResult.String())
	}
	// extracting Supplement
	supplementResult, err := vm.RunString("extractTokenSearchParameters(fhirResource, 'NutritionOrder.supplement.type')")
	if err == nil && supplementResult.String() != "undefined" {
		s.Supplement = []byte(supplementResult.String())
	}
	// extracting Text
	textResult, err := vm.RunString("extractSimpleSearchParameters(fhirResource, 'text')")
	if err == nil && textResult.String() != "undefined" {
		s.Text = textResult.String()
	}
	return nil
}

// TableName overrides the table name from fhir_observations (pluralized) to `fhir_observation`. https://gorm.io/docs/conventions.html#TableName
func (s *FhirNutritionOrder) TableName() string {
	return "fhir_nutrition_order"
}
