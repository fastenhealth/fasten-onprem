package database

import (
	_ "embed"
	"fmt"
	gorm "gorm.io/gorm"
)

//go:embed fhirpath.min.js
var fhirPathJs string

//go:embed searchParameterExtractor.js
var searchParameterExtractorJs string

// Generates all tables in the database associated with these models
func Migrate(gormClient *gorm.DB) error {
	err := gormClient.AutoMigrate(&FhirAccount{}, &FhirAdverseEvent{}, &FhirAllergyIntolerance{}, &FhirAppointment{}, &FhirBinary{}, &FhirCarePlan{}, &FhirCareTeam{}, &FhirClaim{}, &FhirClaimResponse{}, &FhirClinicalImpression{}, &FhirComposition{}, &FhirCondition{}, &FhirConsent{}, &FhirCoverage{}, &FhirCoverageEligibilityRequest{}, &FhirCoverageEligibilityResponse{}, &FhirDevice{}, &FhirDeviceRequest{}, &FhirDiagnosticReport{}, &FhirDocumentManifest{}, &FhirDocumentReference{}, &FhirEncounter{}, &FhirEndpoint{}, &FhirEnrollmentRequest{}, &FhirEnrollmentResponse{}, &FhirExplanationOfBenefit{}, &FhirFamilyMemberHistory{}, &FhirGoal{}, &FhirImagingStudy{}, &FhirImmunization{}, &FhirInsurancePlan{}, &FhirLocation{}, &FhirMedia{}, &FhirMedication{}, &FhirMedicationAdministration{}, &FhirMedicationDispense{}, &FhirMedicationRequest{}, &FhirMedicationStatement{}, &FhirNutritionOrder{}, &FhirObservation{}, &FhirOrganization{}, &FhirOrganizationAffiliation{}, &FhirPatient{}, &FhirPerson{}, &FhirPractitioner{}, &FhirPractitionerRole{}, &FhirProcedure{}, &FhirProvenance{}, &FhirQuestionnaire{}, &FhirQuestionnaireResponse{}, &FhirRelatedPerson{}, &FhirSchedule{}, &FhirServiceRequest{}, &FhirSlot{}, &FhirSpecimen{}, &FhirVisionPrescription{})
	if err != nil {
		return err
	}
	return nil
}

// Returns a map of all the resource names to their corresponding go struct
func NewFhirResourceModelByType(resourceType string) (IFhirResourceModel, error) {
	switch resourceType {
	case "Account":
		return &FhirAccount{}, nil
	case "AdverseEvent":
		return &FhirAdverseEvent{}, nil
	case "AllergyIntolerance":
		return &FhirAllergyIntolerance{}, nil
	case "Appointment":
		return &FhirAppointment{}, nil
	case "Binary":
		return &FhirBinary{}, nil
	case "CarePlan":
		return &FhirCarePlan{}, nil
	case "CareTeam":
		return &FhirCareTeam{}, nil
	case "Claim":
		return &FhirClaim{}, nil
	case "ClaimResponse":
		return &FhirClaimResponse{}, nil
	case "ClinicalImpression":
		return &FhirClinicalImpression{}, nil
	case "Composition":
		return &FhirComposition{}, nil
	case "Condition":
		return &FhirCondition{}, nil
	case "Consent":
		return &FhirConsent{}, nil
	case "Coverage":
		return &FhirCoverage{}, nil
	case "CoverageEligibilityRequest":
		return &FhirCoverageEligibilityRequest{}, nil
	case "CoverageEligibilityResponse":
		return &FhirCoverageEligibilityResponse{}, nil
	case "Device":
		return &FhirDevice{}, nil
	case "DeviceRequest":
		return &FhirDeviceRequest{}, nil
	case "DiagnosticReport":
		return &FhirDiagnosticReport{}, nil
	case "DocumentManifest":
		return &FhirDocumentManifest{}, nil
	case "DocumentReference":
		return &FhirDocumentReference{}, nil
	case "Encounter":
		return &FhirEncounter{}, nil
	case "Endpoint":
		return &FhirEndpoint{}, nil
	case "EnrollmentRequest":
		return &FhirEnrollmentRequest{}, nil
	case "EnrollmentResponse":
		return &FhirEnrollmentResponse{}, nil
	case "ExplanationOfBenefit":
		return &FhirExplanationOfBenefit{}, nil
	case "FamilyMemberHistory":
		return &FhirFamilyMemberHistory{}, nil
	case "Goal":
		return &FhirGoal{}, nil
	case "ImagingStudy":
		return &FhirImagingStudy{}, nil
	case "Immunization":
		return &FhirImmunization{}, nil
	case "InsurancePlan":
		return &FhirInsurancePlan{}, nil
	case "Location":
		return &FhirLocation{}, nil
	case "Media":
		return &FhirMedia{}, nil
	case "Medication":
		return &FhirMedication{}, nil
	case "MedicationAdministration":
		return &FhirMedicationAdministration{}, nil
	case "MedicationDispense":
		return &FhirMedicationDispense{}, nil
	case "MedicationRequest":
		return &FhirMedicationRequest{}, nil
	case "MedicationStatement":
		return &FhirMedicationStatement{}, nil
	case "NutritionOrder":
		return &FhirNutritionOrder{}, nil
	case "Observation":
		return &FhirObservation{}, nil
	case "Organization":
		return &FhirOrganization{}, nil
	case "OrganizationAffiliation":
		return &FhirOrganizationAffiliation{}, nil
	case "Patient":
		return &FhirPatient{}, nil
	case "Person":
		return &FhirPerson{}, nil
	case "Practitioner":
		return &FhirPractitioner{}, nil
	case "PractitionerRole":
		return &FhirPractitionerRole{}, nil
	case "Procedure":
		return &FhirProcedure{}, nil
	case "Provenance":
		return &FhirProvenance{}, nil
	case "Questionnaire":
		return &FhirQuestionnaire{}, nil
	case "QuestionnaireResponse":
		return &FhirQuestionnaireResponse{}, nil
	case "RelatedPerson":
		return &FhirRelatedPerson{}, nil
	case "Schedule":
		return &FhirSchedule{}, nil
	case "ServiceRequest":
		return &FhirServiceRequest{}, nil
	case "Slot":
		return &FhirSlot{}, nil
	case "Specimen":
		return &FhirSpecimen{}, nil
	case "VisionPrescription":
		return &FhirVisionPrescription{}, nil
	default:
		return nil, fmt.Errorf("Invalid resource type for model: %s", resourceType)
	}
}

// Returns a map of all the resource names to their corresponding go struct
func NewFhirResourceModelSliceByType(resourceType string) (interface{}, error) {
	switch resourceType {
	case "Account":
		return []FhirAccount{}, nil
	case "AdverseEvent":
		return []FhirAdverseEvent{}, nil
	case "AllergyIntolerance":
		return []FhirAllergyIntolerance{}, nil
	case "Appointment":
		return []FhirAppointment{}, nil
	case "Binary":
		return []FhirBinary{}, nil
	case "CarePlan":
		return []FhirCarePlan{}, nil
	case "CareTeam":
		return []FhirCareTeam{}, nil
	case "Claim":
		return []FhirClaim{}, nil
	case "ClaimResponse":
		return []FhirClaimResponse{}, nil
	case "ClinicalImpression":
		return []FhirClinicalImpression{}, nil
	case "Composition":
		return []FhirComposition{}, nil
	case "Condition":
		return []FhirCondition{}, nil
	case "Consent":
		return []FhirConsent{}, nil
	case "Coverage":
		return []FhirCoverage{}, nil
	case "CoverageEligibilityRequest":
		return []FhirCoverageEligibilityRequest{}, nil
	case "CoverageEligibilityResponse":
		return []FhirCoverageEligibilityResponse{}, nil
	case "Device":
		return []FhirDevice{}, nil
	case "DeviceRequest":
		return []FhirDeviceRequest{}, nil
	case "DiagnosticReport":
		return []FhirDiagnosticReport{}, nil
	case "DocumentManifest":
		return []FhirDocumentManifest{}, nil
	case "DocumentReference":
		return []FhirDocumentReference{}, nil
	case "Encounter":
		return []FhirEncounter{}, nil
	case "Endpoint":
		return []FhirEndpoint{}, nil
	case "EnrollmentRequest":
		return []FhirEnrollmentRequest{}, nil
	case "EnrollmentResponse":
		return []FhirEnrollmentResponse{}, nil
	case "ExplanationOfBenefit":
		return []FhirExplanationOfBenefit{}, nil
	case "FamilyMemberHistory":
		return []FhirFamilyMemberHistory{}, nil
	case "Goal":
		return []FhirGoal{}, nil
	case "ImagingStudy":
		return []FhirImagingStudy{}, nil
	case "Immunization":
		return []FhirImmunization{}, nil
	case "InsurancePlan":
		return []FhirInsurancePlan{}, nil
	case "Location":
		return []FhirLocation{}, nil
	case "Media":
		return []FhirMedia{}, nil
	case "Medication":
		return []FhirMedication{}, nil
	case "MedicationAdministration":
		return []FhirMedicationAdministration{}, nil
	case "MedicationDispense":
		return []FhirMedicationDispense{}, nil
	case "MedicationRequest":
		return []FhirMedicationRequest{}, nil
	case "MedicationStatement":
		return []FhirMedicationStatement{}, nil
	case "NutritionOrder":
		return []FhirNutritionOrder{}, nil
	case "Observation":
		return []FhirObservation{}, nil
	case "Organization":
		return []FhirOrganization{}, nil
	case "OrganizationAffiliation":
		return []FhirOrganizationAffiliation{}, nil
	case "Patient":
		return []FhirPatient{}, nil
	case "Person":
		return []FhirPerson{}, nil
	case "Practitioner":
		return []FhirPractitioner{}, nil
	case "PractitionerRole":
		return []FhirPractitionerRole{}, nil
	case "Procedure":
		return []FhirProcedure{}, nil
	case "Provenance":
		return []FhirProvenance{}, nil
	case "Questionnaire":
		return []FhirQuestionnaire{}, nil
	case "QuestionnaireResponse":
		return []FhirQuestionnaireResponse{}, nil
	case "RelatedPerson":
		return []FhirRelatedPerson{}, nil
	case "Schedule":
		return []FhirSchedule{}, nil
	case "ServiceRequest":
		return []FhirServiceRequest{}, nil
	case "Slot":
		return []FhirSlot{}, nil
	case "Specimen":
		return []FhirSpecimen{}, nil
	case "VisionPrescription":
		return []FhirVisionPrescription{}, nil
	default:
		return nil, fmt.Errorf("Invalid resource type for model: %s", resourceType)
	}
}

// Returns the GORM table name for a FHIRResource when provided the FhirResource type string
func GetTableNameByResourceType(resourceType string) (string, error) {
	switch resourceType {
	case "Account":
		return "fhir_account", nil
	case "AdverseEvent":
		return "fhir_adverse_event", nil
	case "AllergyIntolerance":
		return "fhir_allergy_intolerance", nil
	case "Appointment":
		return "fhir_appointment", nil
	case "Binary":
		return "fhir_binary", nil
	case "CarePlan":
		return "fhir_care_plan", nil
	case "CareTeam":
		return "fhir_care_team", nil
	case "Claim":
		return "fhir_claim", nil
	case "ClaimResponse":
		return "fhir_claim_response", nil
	case "ClinicalImpression":
		return "fhir_clinical_impression", nil
	case "Composition":
		return "fhir_composition", nil
	case "Condition":
		return "fhir_condition", nil
	case "Consent":
		return "fhir_consent", nil
	case "Coverage":
		return "fhir_coverage", nil
	case "CoverageEligibilityRequest":
		return "fhir_coverage_eligibility_request", nil
	case "CoverageEligibilityResponse":
		return "fhir_coverage_eligibility_response", nil
	case "Device":
		return "fhir_device", nil
	case "DeviceRequest":
		return "fhir_device_request", nil
	case "DiagnosticReport":
		return "fhir_diagnostic_report", nil
	case "DocumentManifest":
		return "fhir_document_manifest", nil
	case "DocumentReference":
		return "fhir_document_reference", nil
	case "Encounter":
		return "fhir_encounter", nil
	case "Endpoint":
		return "fhir_endpoint", nil
	case "EnrollmentRequest":
		return "fhir_enrollment_request", nil
	case "EnrollmentResponse":
		return "fhir_enrollment_response", nil
	case "ExplanationOfBenefit":
		return "fhir_explanation_of_benefit", nil
	case "FamilyMemberHistory":
		return "fhir_family_member_history", nil
	case "Goal":
		return "fhir_goal", nil
	case "ImagingStudy":
		return "fhir_imaging_study", nil
	case "Immunization":
		return "fhir_immunization", nil
	case "InsurancePlan":
		return "fhir_insurance_plan", nil
	case "Location":
		return "fhir_location", nil
	case "Media":
		return "fhir_media", nil
	case "Medication":
		return "fhir_medication", nil
	case "MedicationAdministration":
		return "fhir_medication_administration", nil
	case "MedicationDispense":
		return "fhir_medication_dispense", nil
	case "MedicationRequest":
		return "fhir_medication_request", nil
	case "MedicationStatement":
		return "fhir_medication_statement", nil
	case "NutritionOrder":
		return "fhir_nutrition_order", nil
	case "Observation":
		return "fhir_observation", nil
	case "Organization":
		return "fhir_organization", nil
	case "OrganizationAffiliation":
		return "fhir_organization_affiliation", nil
	case "Patient":
		return "fhir_patient", nil
	case "Person":
		return "fhir_person", nil
	case "Practitioner":
		return "fhir_practitioner", nil
	case "PractitionerRole":
		return "fhir_practitioner_role", nil
	case "Procedure":
		return "fhir_procedure", nil
	case "Provenance":
		return "fhir_provenance", nil
	case "Questionnaire":
		return "fhir_questionnaire", nil
	case "QuestionnaireResponse":
		return "fhir_questionnaire_response", nil
	case "RelatedPerson":
		return "fhir_related_person", nil
	case "Schedule":
		return "fhir_schedule", nil
	case "ServiceRequest":
		return "fhir_service_request", nil
	case "Slot":
		return "fhir_slot", nil
	case "Specimen":
		return "fhir_specimen", nil
	case "VisionPrescription":
		return "fhir_vision_prescription", nil
	default:
		return "", fmt.Errorf("Invalid resource type for table name: %s", resourceType)
	}
}

// Returns a slice of all allowed resource types
func GetAllowedResourceTypes() []string {
	return []string{"Account", "AdverseEvent", "AllergyIntolerance", "Appointment", "Binary", "CarePlan", "CareTeam", "Claim", "ClaimResponse", "ClinicalImpression", "Composition", "Condition", "Consent", "Coverage", "CoverageEligibilityRequest", "CoverageEligibilityResponse", "Device", "DeviceRequest", "DiagnosticReport", "DocumentManifest", "DocumentReference", "Encounter", "Endpoint", "EnrollmentRequest", "EnrollmentResponse", "ExplanationOfBenefit", "FamilyMemberHistory", "Goal", "ImagingStudy", "Immunization", "InsurancePlan", "Location", "Media", "Medication", "MedicationAdministration", "MedicationDispense", "MedicationRequest", "MedicationStatement", "NutritionOrder", "Observation", "Organization", "OrganizationAffiliation", "Patient", "Person", "Practitioner", "PractitionerRole", "Procedure", "Provenance", "Questionnaire", "QuestionnaireResponse", "RelatedPerson", "Schedule", "ServiceRequest", "Slot", "Specimen", "VisionPrescription"}
}
