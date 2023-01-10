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
import {FastenOptions} from './fasten/fasten-options';
import {FastenDisplayModel} from './fasten/fasten-display-model';
// import {BinaryModel} from './resources/binary-model';

export function fhirModelFactory(modelName: string, fhirResource: any, fhirVersion: fhirVersions = fhirVersions.R4, fastenOptions?: FastenOptions):FastenDisplayModel {
 switch (modelName) {
   case "AdverseEvent": {
     return new AdverseEventModel(fhirResource, fhirVersion, fastenOptions)
   }
   case "AllergyIntolerance": {
     return new AllergyIntoleranceModel(fhirResource, fhirVersion, fastenOptions)
   }
   case "Appointment": {
     return new AppointmentModel(fhirResource, fhirVersion, fastenOptions)
   }
   // case "Binary": {
   //   return new BinaryModel(fhirResource, fhirVersion, fastenOptions)
   // }
   case "CarePlan": {
     return new CarePlanModel(fhirResource, fhirVersion, fastenOptions)
   }
   case "CareTeam": {
     return new CareTeamModel(fhirResource, fhirVersion, fastenOptions)
   }
   // case "Claim": {
   //   return new ClaimModel(fhirResource, fhirVersion, fastenOptions)
   // }
   // case "ClaimResponse": {
   //   return new ClaimResponseModel(fhirResource, fhirVersion, fastenOptions)
   // }
   case "Condition": {
     return new ConditionModel(fhirResource, fhirVersion, fastenOptions)
   }
   // case "Coverage": {
   //   return new CoverageModel(fhirResource, fhirVersion, fastenOptions)
   // }
   case "Device": {
     return new DeviceModel(fhirResource, fhirVersion, fastenOptions)
   }
   case "DiagnosticReport": {
     return new DiagnosticReportModel(fhirResource, fhirVersion, fastenOptions)
   }
   case "DocumentReference": {
     return new DocumentReferenceModel(fhirResource, fhirVersion, fastenOptions)
   }
   case "Encounter": {
     return new EncounterModel(fhirResource, fhirVersion, fastenOptions)
   }
   // case "ExplanationOfBenefit": {
   //   return new ExplanationOfBenefitModel(fhirResource, fhirVersion, fastenOptions)
   // }
   // case "FamilyMemberHistory": {
   //   return new FamilyMemberHistoryModel(fhirResource, fhirVersion, fastenOptions)
   // }
   case "Goal": {
     return new GoalModel(fhirResource, fhirVersion, fastenOptions)
   }
   case "Immunization": {
     return new ImmunizationModel(fhirResource, fhirVersion, fastenOptions)
   }
   case "Location": {
     return new LocationModel(fhirResource, fhirVersion, fastenOptions)
   }
   case "Medication": {
     return new MedicationModel(fhirResource, fhirVersion, fastenOptions)
   }
   // case "MedicationAdministration": {
   //   return new MedicationAdministrationModel(fhirResource, fhirVersion, fastenOptions)
   // }
   case "MedicationDispense": {
     return new MedicationDispenseModel(fhirResource, fhirVersion, fastenOptions)
   }
   // case "MedicationKnowledge": {
   //   return new MedicationKnowledgeModel(fhirResource, fhirVersion, fastenOptions)
   // }
   // case "MedicationOrder": {
   //   return new MedicationOrderModel(fhirResource, fhirVersion, fastenOptions)
   // }
   // case "MedicationRequest": {
   //   return new MedicationRequestModel(fhirResource, fhirVersion, fastenOptions)
   // }
   // case "MedicationStatement": {
   //   return new MedicationStatementModel(fhirResource, fhirVersion, fastenOptions)
   // }
   case "Observation": {
     return new ObservationModel(fhirResource, fhirVersion, fastenOptions)
   }
   case "Organization": {
     return new OrganizationModel(fhirResource, fhirVersion, fastenOptions)
   }
   case "Patient": {
     return new PatientModel(fhirResource, fhirVersion, fastenOptions)
   }
   case "Practitioner": {
     return new PractitionerModel(fhirResource, fhirVersion, fastenOptions)
   }
   case "PractitionerRole": {
     return new PractitionerRoleModel(fhirResource, fhirVersion, fastenOptions)
   }
   case "Procedure": {
     return new ProcedureModel(fhirResource, fhirVersion, fastenOptions)
   }
   // case "Questionnaire": {
   //   return new QuestionnaireModel(fhirResource, fhirVersion, fastenOptions)
   // }
   // case "QuestionnaireResponse": {
   //   return new QuestionnaireResponseModel(fhirResource, fhirVersion, fastenOptions)
   // }
   // case "ReferralRequest": {
   //   return new ReferralRequestModel(fhirResource, fhirVersion, fastenOptions)
   // }
   case "RelatedPerson": {
     return new RelatedPersonModel(fhirResource, fhirVersion, fastenOptions)
   }
   case "ResearchStudy": {
     return new ResearchStudyModel(fhirResource, fhirVersion, fastenOptions)
   }
   // case "ResourceCategory": {
   //   return new ResourceCategoryModel(fhirResource, fhirVersion, fastenOptions)
   // }
   default: {
     throw new Error("Unknown resource data structure")
   }
 }
}
