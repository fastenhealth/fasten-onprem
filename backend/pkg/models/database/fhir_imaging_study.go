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

type FhirImagingStudy struct {
	models.OriginBase
	// The order for the image
	// https://hl7.org/fhir/r4/search.html#reference
	Basedon datatypes.JSON `gorm:"column:basedon;type:text;serializer:json" json:"basedon,omitempty"`
	// The body site studied
	// https://hl7.org/fhir/r4/search.html#token
	Bodysite datatypes.JSON `gorm:"column:bodysite;type:text;serializer:json" json:"bodysite,omitempty"`
	// The type of the instance
	// https://hl7.org/fhir/r4/search.html#token
	DicomClass datatypes.JSON `gorm:"column:dicomClass;type:text;serializer:json" json:"dicomClass,omitempty"`
	// The context of the study
	// https://hl7.org/fhir/r4/search.html#reference
	Encounter datatypes.JSON `gorm:"column:encounter;type:text;serializer:json" json:"encounter,omitempty"`
	// The endpoint for the study or series
	// https://hl7.org/fhir/r4/search.html#reference
	Endpoint datatypes.JSON `gorm:"column:endpoint;type:text;serializer:json" json:"endpoint,omitempty"`
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
	// SOP Instance UID for an instance
	// https://hl7.org/fhir/r4/search.html#token
	Instance datatypes.JSON `gorm:"column:instance;type:text;serializer:json" json:"instance,omitempty"`
	// Who interpreted the images
	// https://hl7.org/fhir/r4/search.html#reference
	Interpreter datatypes.JSON `gorm:"column:interpreter;type:text;serializer:json" json:"interpreter,omitempty"`
	// Language of the resource content
	// https://hl7.org/fhir/r4/search.html#token
	Language datatypes.JSON `gorm:"column:language;type:text;serializer:json" json:"language,omitempty"`
	// When the resource version last changed
	// https://hl7.org/fhir/r4/search.html#date
	LastUpdated time.Time `gorm:"column:lastUpdated;type:datetime" json:"lastUpdated,omitempty"`
	// The modality of the series
	// https://hl7.org/fhir/r4/search.html#token
	Modality datatypes.JSON `gorm:"column:modality;type:text;serializer:json" json:"modality,omitempty"`
	// The person who performed the study
	// https://hl7.org/fhir/r4/search.html#reference
	Performer datatypes.JSON `gorm:"column:performer;type:text;serializer:json" json:"performer,omitempty"`
	// Profiles this resource claims to conform to
	// https://hl7.org/fhir/r4/search.html#reference
	Profile datatypes.JSON `gorm:"column:profile;type:text;serializer:json" json:"profile,omitempty"`
	// The raw resource content in JSON format
	// https://hl7.org/fhir/r4/search.html#special
	RawResource datatypes.JSON `gorm:"column:rawResource;type:text;serializer:json" json:"rawResource,omitempty"`
	// The reason for the study
	// https://hl7.org/fhir/r4/search.html#token
	Reason datatypes.JSON `gorm:"column:reason;type:text;serializer:json" json:"reason,omitempty"`
	// The referring physician
	// https://hl7.org/fhir/r4/search.html#reference
	Referrer datatypes.JSON `gorm:"column:referrer;type:text;serializer:json" json:"referrer,omitempty"`
	// DICOM Series Instance UID for a series
	// https://hl7.org/fhir/r4/search.html#token
	Series datatypes.JSON `gorm:"column:series;type:text;serializer:json" json:"series,omitempty"`
	// Identifies where the resource comes from
	// https://hl7.org/fhir/r4/search.html#uri
	SourceUri string `gorm:"column:sourceUri;type:text" json:"sourceUri,omitempty"`
	// When the study was started
	// https://hl7.org/fhir/r4/search.html#date
	Started time.Time `gorm:"column:started;type:datetime" json:"started,omitempty"`
	// The status of the study
	// https://hl7.org/fhir/r4/search.html#token
	Status datatypes.JSON `gorm:"column:status;type:text;serializer:json" json:"status,omitempty"`
	// Who the study is about
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

func (s *FhirImagingStudy) SetOriginBase(originBase models.OriginBase) {
	s.OriginBase = originBase
}
func (s *FhirImagingStudy) GetSearchParameters() map[string]string {
	searchParameters := map[string]string{
		"basedon":     "reference",
		"bodysite":    "token",
		"dicomClass":  "token",
		"encounter":   "reference",
		"endpoint":    "reference",
		"identifier":  "token",
		"instance":    "token",
		"interpreter": "reference",
		"language":    "token",
		"lastUpdated": "date",
		"modality":    "token",
		"performer":   "reference",
		"profile":     "reference",
		"rawResource": "special",
		"reason":      "token",
		"referrer":    "reference",
		"series":      "token",
		"sourceUri":   "uri",
		"started":     "date",
		"status":      "token",
		"subject":     "reference",
		"tag":         "token",
		"text":        "string",
		"type":        "special",
	}
	return searchParameters
}
func (s *FhirImagingStudy) PopulateAndExtractSearchParameters(rawResource json.RawMessage) error {
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
	// extracting Basedon
	basedonResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'ImagingStudy.basedOn'))")
	if err == nil && basedonResult.String() != "undefined" {
		s.Basedon = []byte(basedonResult.String())
	}
	// extracting Bodysite
	bodysiteResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'ImagingStudy.series.bodySite'))")
	if err == nil && bodysiteResult.String() != "undefined" {
		s.Bodysite = []byte(bodysiteResult.String())
	}
	// extracting DicomClass
	dicomClassResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'ImagingStudy.series.instance.sopClass'))")
	if err == nil && dicomClassResult.String() != "undefined" {
		s.DicomClass = []byte(dicomClassResult.String())
	}
	// extracting Encounter
	encounterResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'ImagingStudy.encounter'))")
	if err == nil && encounterResult.String() != "undefined" {
		s.Encounter = []byte(encounterResult.String())
	}
	// extracting Endpoint
	endpointResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'ImagingStudy.endpoint | ImagingStudy.series.endpoint'))")
	if err == nil && endpointResult.String() != "undefined" {
		s.Endpoint = []byte(endpointResult.String())
	}
	// extracting Identifier
	identifierResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'AllergyIntolerance.identifier | CarePlan.identifier | CareTeam.identifier | Composition.identifier | Condition.identifier | Consent.identifier | DetectedIssue.identifier | DeviceRequest.identifier | DiagnosticReport.identifier | DocumentManifest.masterIdentifier | DocumentManifest.identifier | DocumentReference.masterIdentifier | DocumentReference.identifier | Encounter.identifier | EpisodeOfCare.identifier | FamilyMemberHistory.identifier | Goal.identifier | ImagingStudy.identifier | Immunization.identifier | List.identifier | MedicationAdministration.identifier | MedicationDispense.identifier | MedicationRequest.identifier | MedicationStatement.identifier | NutritionOrder.identifier | Observation.identifier | Procedure.identifier | RiskAssessment.identifier | ServiceRequest.identifier | SupplyDelivery.identifier | SupplyRequest.identifier | VisionPrescription.identifier'))")
	if err == nil && identifierResult.String() != "undefined" {
		s.Identifier = []byte(identifierResult.String())
	}
	// extracting Instance
	instanceResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'ImagingStudy.series.instance.uid'))")
	if err == nil && instanceResult.String() != "undefined" {
		s.Instance = []byte(instanceResult.String())
	}
	// extracting Interpreter
	interpreterResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'ImagingStudy.interpreter'))")
	if err == nil && interpreterResult.String() != "undefined" {
		s.Interpreter = []byte(interpreterResult.String())
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
	// extracting Modality
	modalityResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'ImagingStudy.series.modality'))")
	if err == nil && modalityResult.String() != "undefined" {
		s.Modality = []byte(modalityResult.String())
	}
	// extracting Performer
	performerResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'ImagingStudy.series.performer.actor'))")
	if err == nil && performerResult.String() != "undefined" {
		s.Performer = []byte(performerResult.String())
	}
	// extracting Profile
	profileResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Resource.meta.profile'))")
	if err == nil && profileResult.String() != "undefined" {
		s.Profile = []byte(profileResult.String())
	}
	// extracting Reason
	reasonResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'ImagingStudy.reasonCode'))")
	if err == nil && reasonResult.String() != "undefined" {
		s.Reason = []byte(reasonResult.String())
	}
	// extracting Referrer
	referrerResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'ImagingStudy.referrer'))")
	if err == nil && referrerResult.String() != "undefined" {
		s.Referrer = []byte(referrerResult.String())
	}
	// extracting Series
	seriesResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'ImagingStudy.series.uid'))")
	if err == nil && seriesResult.String() != "undefined" {
		s.Series = []byte(seriesResult.String())
	}
	// extracting SourceUri
	sourceUriResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'Resource.meta.source')[0]")
	if err == nil && sourceUriResult.String() != "undefined" {
		s.SourceUri = sourceUriResult.String()
	}
	// extracting Started
	startedResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'ImagingStudy.started')[0]")
	if err == nil && startedResult.String() != "undefined" {
		t, err := time.Parse(time.RFC3339, startedResult.String())
		if err == nil {
			s.Started = t
		}
	}
	// extracting Status
	statusResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'ImagingStudy.status'))")
	if err == nil && statusResult.String() != "undefined" {
		s.Status = []byte(statusResult.String())
	}
	// extracting Subject
	subjectResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'ImagingStudy.subject'))")
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

// TableName overrides the table name from fhir_observations (pluralized) to `fhir_observation`. https://gorm.io/docs/conventions.html#TableName
func (s *FhirImagingStudy) TableName() string {
	return "fhir_imaging_study"
}