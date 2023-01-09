import {fhirVersions} from './constants';
import {AdverseEventModel} from './resources/adverse-event-model';
import {AllergyIntoleranceModel} from './resources/allergy-intolerance-model';
import {AppointmentModel} from './resources/appointment-model';
import {CarePlanModel} from './resources/care-plan-model';
import {CareTeamModel} from './resources/care-team-model';
import {ConditionModel} from './resources/condition-model';
import {DeviceModel} from './resources/device-model';
import {DiagnosticReportModel} from './resources/diagnostic-report-model';
import {DocumentReferenceModel} from './resources/document-reference-model';
import {EncounterModel} from './resources/encounter-model';
import {GoalModel} from './resources/goal-model';
import {ImmunizationModel} from './resources/immunization-model';
import {LocationModel} from './resources/location-model';
import {MedicationDispenseModel} from './resources/medication-dispense-model';
import {MedicationModel} from './resources/medication-model';
import {ObservationModel} from './resources/observation-model';
import {OrganizationModel} from './resources/organization-model';
import {PatientModel} from './resources/patient-model';
import {PractitionerModel} from './resources/practitioner-model';
import {PractitionerRoleModel} from './resources/practitioner-role-model';
import {ProcedureModel} from './resources/procedure-model';
import {RelatedPersonModel} from './resources/related-person-model';
import {ResearchStudyModel} from './resources/research-study-model';
// import {BinaryModel} from './resources/binary-model';

export function fhirModelFactory(modelName: string, fhirResource: any, fhirVersion: fhirVersions = fhirVersions.R4):any {
 switch (modelName) {
   case "AdverseEvent": {
     return new AdverseEventModel(fhirResource, fhirVersion)
   }
   case "AllergyIntolerance": {
     return new AllergyIntoleranceModel(fhirResource, fhirVersion)
   }
   case "Appointment": {
     return new AppointmentModel(fhirResource, fhirVersion)
   }
   // case "Binary": {
   //   return new BinaryModel(fhirResource, fhirVersion)
   // }
   case "CarePlan": {
     return new CarePlanModel(fhirResource, fhirVersion)
   }
   case "CareTeam": {
     return new CareTeamModel(fhirResource, fhirVersion)
   }
   // case "Claim": {
   //   return new ClaimModel(fhirResource, fhirVersion)
   // }
   // case "ClaimResponse": {
   //   return new ClaimResponseModel(fhirResource, fhirVersion)
   // }
   case "Condition": {
     return new ConditionModel(fhirResource, fhirVersion)
   }
   // case "Coverage": {
   //   return new CoverageModel(fhirResource, fhirVersion)
   // }
   case "Device": {
     return new DeviceModel(fhirResource, fhirVersion)
   }
   case "DiagnosticReport": {
     return new DiagnosticReportModel(fhirResource, fhirVersion)
   }
   case "DocumentReference": {
     return new DocumentReferenceModel(fhirResource, fhirVersion)
   }
   case "Encounter": {
     return new EncounterModel(fhirResource, fhirVersion)
   }
   // case "ExplanationOfBenefit": {
   //   return new ExplanationOfBenefitModel(fhirResource, fhirVersion)
   // }
   // case "FamilyMemberHistory": {
   //   return new FamilyMemberHistoryModel(fhirResource, fhirVersion)
   // }
   case "Goal": {
     return new GoalModel(fhirResource, fhirVersion)
   }
   case "Immunization": {
     return new ImmunizationModel(fhirResource, fhirVersion)
   }
   case "Location": {
     return new LocationModel(fhirResource, fhirVersion)
   }
   case "Medication": {
     return new MedicationModel(fhirResource, fhirVersion)
   }
   // case "MedicationAdministration": {
   //   return new MedicationAdministrationModel(fhirResource, fhirVersion)
   // }
   case "MedicationDispense": {
     return new MedicationDispenseModel(fhirResource, fhirVersion)
   }
   // case "MedicationKnowledge": {
   //   return new MedicationKnowledgeModel(fhirResource, fhirVersion)
   // }
   // case "MedicationOrder": {
   //   return new MedicationOrderModel(fhirResource, fhirVersion)
   // }
   // case "MedicationRequest": {
   //   return new MedicationRequestModel(fhirResource, fhirVersion)
   // }
   // case "MedicationStatement": {
   //   return new MedicationStatementModel(fhirResource, fhirVersion)
   // }
   case "Observation": {
     return new ObservationModel(fhirResource, fhirVersion)
   }
   case "Organization": {
     return new OrganizationModel(fhirResource, fhirVersion)
   }
   case "Patient": {
     return new PatientModel(fhirResource, fhirVersion)
   }
   case "Practitioner": {
     return new PractitionerModel(fhirResource, fhirVersion)
   }
   case "PractitionerRole": {
     return new PractitionerRoleModel(fhirResource, fhirVersion)
   }
   case "Procedure": {
     return new ProcedureModel(fhirResource, fhirVersion)
   }
   // case "Questionnaire": {
   //   return new QuestionnaireModel(fhirResource, fhirVersion)
   // }
   // case "QuestionnaireResponse": {
   //   return new QuestionnaireResponseModel(fhirResource, fhirVersion)
   // }
   // case "ReferralRequest": {
   //   return new ReferralRequestModel(fhirResource, fhirVersion)
   // }
   case "RelatedPerson": {
     return new RelatedPersonModel(fhirResource, fhirVersion)
   }
   case "ResearchStudy": {
     return new ResearchStudyModel(fhirResource, fhirVersion)
   }
   // case "ResourceCategory": {
   //   return new ResourceCategoryModel(fhirResource, fhirVersion)
   // }
   default: {
     throw new Error("Unknown resource data structure")
   }
 }
}
