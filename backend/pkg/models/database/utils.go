package database

import (
	_ "embed"
	"fmt"
	gorm "gorm.io/gorm"
)

//go:embed fhirpath.min.js
var fhirPathJs string

// Generates all tables in the database associated with these models
func Migrate(gormClient *gorm.DB) error {
	err := gormClient.AutoMigrate(&FhirAdverseEvent{}, &FhirAllergyIntolerance{}, &FhirAppointment{}, &FhirBinary{}, &FhirCarePlan{}, &FhirCareTeam{}, &FhirClaim{}, &FhirClaimResponse{}, &FhirCondition{}, &FhirCoverage{}, &FhirCoverageEligibilityRequest{}, &FhirCoverageEligibilityResponse{}, &FhirDevice{}, &FhirDeviceRequest{}, &FhirDiagnosticReport{}, &FhirDocumentManifest{}, &FhirDocumentReference{}, &FhirEncounter{}, &FhirEndpoint{}, &FhirEnrollmentRequest{}, &FhirEnrollmentResponse{}, &FhirExplanationOfBenefit{}, &FhirFamilyMemberHistory{}, &FhirGoal{}, &FhirImagingStudy{}, &FhirImmunization{}, &FhirInsurancePlan{}, &FhirLocation{}, &FhirMedia{}, &FhirMedication{}, &FhirMedicationAdministration{}, &FhirMedicationDispense{}, &FhirMedicationRequest{}, &FhirMedicationStatement{}, &FhirNutritionOrder{}, &FhirObservation{}, &FhirOrganization{}, &FhirOrganizationAffiliation{}, &FhirPatient{}, &FhirPerson{}, &FhirPractitionerRole{}, &FhirPractitioner{}, &FhirProcedure{}, &FhirProvenance{}, &FhirQuestionnaire{}, &FhirQuestionnaireResponse{}, &FhirRelatedPerson{}, &FhirServiceRequest{}, &FhirSpecimen{}, &FhirVisionPrescription{})
	if err != nil {
		return err
	}
	return nil
}

// Returns a map of all the resource names to their corresponding go struct
func NewFhirResourceModelByType(resourceType string) (IFhirResourceModel, error) {
	switch resourceType {
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
	case "Condition":
		return &FhirCondition{}, nil
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
	case "PractitionerRole":
		return &FhirPractitionerRole{}, nil
	case "Practitioner":
		return &FhirPractitioner{}, nil
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
	case "ServiceRequest":
		return &FhirServiceRequest{}, nil
	case "Specimen":
		return &FhirSpecimen{}, nil
	case "VisionPrescription":
		return &FhirVisionPrescription{}, nil
	default:
		return nil, fmt.Errorf("Invalid resource type: %s", resourceType)
	}
}
