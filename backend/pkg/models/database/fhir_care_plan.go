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

type FhirCarePlan struct {
	models.OriginBase
	// Detail type of activity
	// https://hl7.org/fhir/r4/search.html#token
	ActivityCode datatypes.JSON `gorm:"column:activityCode;type:text;serializer:json" json:"activityCode,omitempty"`
	// Specified date occurs within period specified by CarePlan.activity.detail.scheduled[x]
	// https://hl7.org/fhir/r4/search.html#date
	ActivityDate time.Time `gorm:"column:activityDate;type:datetime" json:"activityDate,omitempty"`
	// Activity details defined in specific resource
	// https://hl7.org/fhir/r4/search.html#reference
	ActivityReference datatypes.JSON `gorm:"column:activityReference;type:text;serializer:json" json:"activityReference,omitempty"`
	// Fulfills CarePlan
	// https://hl7.org/fhir/r4/search.html#reference
	BasedOn datatypes.JSON `gorm:"column:basedOn;type:text;serializer:json" json:"basedOn,omitempty"`
	// Who's involved in plan?
	// https://hl7.org/fhir/r4/search.html#reference
	CareTeam datatypes.JSON `gorm:"column:careTeam;type:text;serializer:json" json:"careTeam,omitempty"`
	// Type of plan
	// https://hl7.org/fhir/r4/search.html#token
	Category datatypes.JSON `gorm:"column:category;type:text;serializer:json" json:"category,omitempty"`
	// Health issues this plan addresses
	// https://hl7.org/fhir/r4/search.html#reference
	Condition datatypes.JSON `gorm:"column:condition;type:text;serializer:json" json:"condition,omitempty"`
	/*
	   Multiple Resources:

	   * [AllergyIntolerance](allergyintolerance.html): Date first version of the resource instance was recorded
	   * [CarePlan](careplan.html): Time period plan covers
	   * [CareTeam](careteam.html): Time period team covers
	   * [ClinicalImpression](clinicalimpression.html): When the assessment was documented
	   * [Composition](composition.html): Composition editing time
	   * [Consent](consent.html): When this Consent was created or indexed
	   * [DiagnosticReport](diagnosticreport.html): The clinically relevant time of the report
	   * [Encounter](encounter.html): A date within the period the Encounter lasted
	   * [EpisodeOfCare](episodeofcare.html): The provided date search value falls within the episode of care's period
	   * [FamilyMemberHistory](familymemberhistory.html): When history was recorded or last updated
	   * [Flag](flag.html): Time period when flag is active
	   * [Immunization](immunization.html): Vaccination  (non)-Administration Date
	   * [List](list.html): When the list was prepared
	   * [Observation](observation.html): Obtained date/time. If the obtained element is a period, a date that falls in the period
	   * [Procedure](procedure.html): When the procedure was performed
	   * [RiskAssessment](riskassessment.html): When was assessment made?
	   * [SupplyRequest](supplyrequest.html): When the request was made
	*/
	// https://hl7.org/fhir/r4/search.html#date
	Date time.Time `gorm:"column:date;type:datetime" json:"date,omitempty"`
	// Encounter created as part of
	// https://hl7.org/fhir/r4/search.html#reference
	Encounter datatypes.JSON `gorm:"column:encounter;type:text;serializer:json" json:"encounter,omitempty"`
	// Desired outcome of plan
	// https://hl7.org/fhir/r4/search.html#reference
	Goal datatypes.JSON `gorm:"column:goal;type:text;serializer:json" json:"goal,omitempty"`
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
	// proposal | plan | order | option
	// https://hl7.org/fhir/r4/search.html#token
	Intent datatypes.JSON `gorm:"column:intent;type:text;serializer:json" json:"intent,omitempty"`
	// Language of the resource content
	// https://hl7.org/fhir/r4/search.html#token
	Language datatypes.JSON `gorm:"column:language;type:text;serializer:json" json:"language,omitempty"`
	// When the resource version last changed
	// https://hl7.org/fhir/r4/search.html#date
	LastUpdated time.Time `gorm:"column:lastUpdated;type:datetime" json:"lastUpdated,omitempty"`
	// Part of referenced CarePlan
	// https://hl7.org/fhir/r4/search.html#reference
	PartOf datatypes.JSON `gorm:"column:partOf;type:text;serializer:json" json:"partOf,omitempty"`
	// Matches if the practitioner is listed as a performer in any of the "simple" activities.  (For performers of the detailed activities, chain through the activitydetail search parameter.)
	// https://hl7.org/fhir/r4/search.html#reference
	Performer datatypes.JSON `gorm:"column:performer;type:text;serializer:json" json:"performer,omitempty"`
	// Profiles this resource claims to conform to
	// https://hl7.org/fhir/r4/search.html#reference
	Profile datatypes.JSON `gorm:"column:profile;type:text;serializer:json" json:"profile,omitempty"`
	// The raw resource content in JSON format
	// https://hl7.org/fhir/r4/search.html#special
	RawResource datatypes.JSON `gorm:"column:rawResource;type:text;serializer:json" json:"rawResource,omitempty"`
	// CarePlan replaced by this CarePlan
	// https://hl7.org/fhir/r4/search.html#reference
	Replaces datatypes.JSON `gorm:"column:replaces;type:text;serializer:json" json:"replaces,omitempty"`
	// Identifies where the resource comes from
	// https://hl7.org/fhir/r4/search.html#uri
	SourceUri string `gorm:"column:sourceUri;type:text" json:"sourceUri,omitempty"`
	// draft | active | on-hold | revoked | completed | entered-in-error | unknown
	// https://hl7.org/fhir/r4/search.html#token
	Status datatypes.JSON `gorm:"column:status;type:text;serializer:json" json:"status,omitempty"`
	// Who the care plan is for
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

func (s *FhirCarePlan) SetOriginBase(originBase models.OriginBase) {
	s.OriginBase = originBase
}
func (s *FhirCarePlan) GetSearchParameters() map[string]string {
	searchParameters := map[string]string{
		"activityCode":          "token",
		"activityDate":          "date",
		"activityReference":     "reference",
		"basedOn":               "reference",
		"careTeam":              "reference",
		"category":              "token",
		"condition":             "reference",
		"date":                  "date",
		"encounter":             "reference",
		"goal":                  "reference",
		"identifier":            "token",
		"instantiatesCanonical": "reference",
		"instantiatesUri":       "uri",
		"intent":                "token",
		"language":              "token",
		"lastUpdated":           "date",
		"partOf":                "reference",
		"performer":             "reference",
		"profile":               "reference",
		"rawResource":           "special",
		"replaces":              "reference",
		"sourceUri":             "uri",
		"status":                "token",
		"subject":               "reference",
		"tag":                   "token",
		"text":                  "string",
		"type":                  "special",
	}
	return searchParameters
}
func (s *FhirCarePlan) PopulateAndExtractSearchParameters(rawResource json.RawMessage) error {
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
	// extracting ActivityCode
	activityCodeResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'CarePlan.activity.detail.code'))")
	if err == nil && activityCodeResult.String() != "undefined" {
		s.ActivityCode = []byte(activityCodeResult.String())
	}
	// extracting ActivityDate
	activityDateResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'CarePlan.activity.detail.scheduled')[0]")
	if err == nil && activityDateResult.String() != "undefined" {
		t, err := time.Parse(time.RFC3339, activityDateResult.String())
		if err == nil {
			s.ActivityDate = t
		}
	}
	// extracting ActivityReference
	activityReferenceResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'CarePlan.activity.reference'))")
	if err == nil && activityReferenceResult.String() != "undefined" {
		s.ActivityReference = []byte(activityReferenceResult.String())
	}
	// extracting BasedOn
	basedOnResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'CarePlan.basedOn'))")
	if err == nil && basedOnResult.String() != "undefined" {
		s.BasedOn = []byte(basedOnResult.String())
	}
	// extracting CareTeam
	careTeamResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'CarePlan.careTeam'))")
	if err == nil && careTeamResult.String() != "undefined" {
		s.CareTeam = []byte(careTeamResult.String())
	}
	// extracting Category
	categoryResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'CarePlan.category'))")
	if err == nil && categoryResult.String() != "undefined" {
		s.Category = []byte(categoryResult.String())
	}
	// extracting Condition
	conditionResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'CarePlan.addresses'))")
	if err == nil && conditionResult.String() != "undefined" {
		s.Condition = []byte(conditionResult.String())
	}
	// extracting Date
	dateResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'AllergyIntolerance.recordedDate | CarePlan.period | CareTeam.period | ClinicalImpression.date | Composition.date | Consent.dateTime | DiagnosticReport.effective | Encounter.period | EpisodeOfCare.period | FamilyMemberHistory.date | Flag.period | (Immunization.occurrencedateTime) | List.date | Observation.effective | Procedure.performed | (RiskAssessment.occurrencedateTime) | SupplyRequest.authoredOn')[0]")
	if err == nil && dateResult.String() != "undefined" {
		t, err := time.Parse(time.RFC3339, dateResult.String())
		if err == nil {
			s.Date = t
		}
	}
	// extracting Encounter
	encounterResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'CarePlan.encounter'))")
	if err == nil && encounterResult.String() != "undefined" {
		s.Encounter = []byte(encounterResult.String())
	}
	// extracting Goal
	goalResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'CarePlan.goal'))")
	if err == nil && goalResult.String() != "undefined" {
		s.Goal = []byte(goalResult.String())
	}
	// extracting Identifier
	identifierResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'AllergyIntolerance.identifier | CarePlan.identifier | CareTeam.identifier | Composition.identifier | Condition.identifier | Consent.identifier | DetectedIssue.identifier | DeviceRequest.identifier | DiagnosticReport.identifier | DocumentManifest.masterIdentifier | DocumentManifest.identifier | DocumentReference.masterIdentifier | DocumentReference.identifier | Encounter.identifier | EpisodeOfCare.identifier | FamilyMemberHistory.identifier | Goal.identifier | ImagingStudy.identifier | Immunization.identifier | List.identifier | MedicationAdministration.identifier | MedicationDispense.identifier | MedicationRequest.identifier | MedicationStatement.identifier | NutritionOrder.identifier | Observation.identifier | Procedure.identifier | RiskAssessment.identifier | ServiceRequest.identifier | SupplyDelivery.identifier | SupplyRequest.identifier | VisionPrescription.identifier'))")
	if err == nil && identifierResult.String() != "undefined" {
		s.Identifier = []byte(identifierResult.String())
	}
	// extracting InstantiatesCanonical
	instantiatesCanonicalResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'CarePlan.instantiatesCanonical'))")
	if err == nil && instantiatesCanonicalResult.String() != "undefined" {
		s.InstantiatesCanonical = []byte(instantiatesCanonicalResult.String())
	}
	// extracting InstantiatesUri
	instantiatesUriResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'CarePlan.instantiatesUri')[0]")
	if err == nil && instantiatesUriResult.String() != "undefined" {
		s.InstantiatesUri = instantiatesUriResult.String()
	}
	// extracting Intent
	intentResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'CarePlan.intent'))")
	if err == nil && intentResult.String() != "undefined" {
		s.Intent = []byte(intentResult.String())
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
	partOfResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'CarePlan.partOf'))")
	if err == nil && partOfResult.String() != "undefined" {
		s.PartOf = []byte(partOfResult.String())
	}
	// extracting Performer
	performerResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'CarePlan.activity.detail.performer'))")
	if err == nil && performerResult.String() != "undefined" {
		s.Performer = []byte(performerResult.String())
	}
	// extracting Profile
	profileResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'Resource.meta.profile'))")
	if err == nil && profileResult.String() != "undefined" {
		s.Profile = []byte(profileResult.String())
	}
	// extracting Replaces
	replacesResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'CarePlan.replaces'))")
	if err == nil && replacesResult.String() != "undefined" {
		s.Replaces = []byte(replacesResult.String())
	}
	// extracting SourceUri
	sourceUriResult, err := vm.RunString("window.fhirpath.evaluate(fhirResource, 'Resource.meta.source')[0]")
	if err == nil && sourceUriResult.String() != "undefined" {
		s.SourceUri = sourceUriResult.String()
	}
	// extracting Status
	statusResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'CarePlan.status'))")
	if err == nil && statusResult.String() != "undefined" {
		s.Status = []byte(statusResult.String())
	}
	// extracting Subject
	subjectResult, err := vm.RunString("JSON.stringify(window.fhirpath.evaluate(fhirResource, 'CarePlan.subject'))")
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
