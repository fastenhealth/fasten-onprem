import {fhirVersions, ResourceType} from './constants';
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
import {MedicationRequestModel} from './resources/medication-request-model';

// import {BinaryModel} from './resources/binary-model';

export function fhirModelFactory(modelResourceType: ResourceType, fhirResourceWrapper: any, fhirVersion: fhirVersions = fhirVersions.R4, fastenOptions?: FastenOptions): FastenDisplayModel {

  let resourceModel: FastenDisplayModel
  switch (modelResourceType) {
    case "AdverseEvent":
      resourceModel = new AdverseEventModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case "AllergyIntolerance":
      resourceModel = new AllergyIntoleranceModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case "Appointment":
      resourceModel = new AppointmentModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break

    // case "Binary": {
    //   resourceModel = new BinaryModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    // }
    case "CarePlan":
      resourceModel = new CarePlanModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case "CareTeam":
      resourceModel = new CareTeamModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    // case "Claim":
    //   resourceModel = new ClaimModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    // break
    // case "ClaimResponse":
    //   resourceModel = new ClaimResponseModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    // break
    case "Condition":
      resourceModel = new ConditionModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case "Composition":
      resourceModel = new ConditionModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    // case "Coverage":
    //   resourceModel = new CoverageModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    // break
    case "Device":
      resourceModel = new DeviceModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case "DiagnosticReport":
      resourceModel = new DiagnosticReportModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case "DocumentReference":
      resourceModel = new DocumentReferenceModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case "Encounter":
      resourceModel = new EncounterModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    // case "ExplanationOfBenefit":
    //   resourceModel = new ExplanationOfBenefitModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    // break
    // case "FamilyMemberHistory":
    //   resourceModel = new FamilyMemberHistoryModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    //break
    case "Goal":
      resourceModel = new GoalModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case "Immunization":
      resourceModel = new ImmunizationModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case "Location":
      resourceModel = new LocationModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case "Medication":
      resourceModel = new MedicationModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    // case "MedicationAdministration":
    //   resourceModel = new MedicationAdministrationModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    // break
    case "MedicationDispense":
      resourceModel = new MedicationDispenseModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    // case "MedicationKnowledge":
    //   resourceModel = new MedicationKnowledgeModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    // break
    // case "MedicationOrder":
    //   resourceModel = new MedicationOrderModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    // break
    case "MedicationRequest":
      resourceModel = new MedicationRequestModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    break
    // case "MedicationStatement":
    //   resourceModel = new MedicationStatementModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    // break
    case "Observation":
      resourceModel = new ObservationModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case "Organization":
      resourceModel = new OrganizationModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case "Patient":
      resourceModel = new PatientModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case "Practitioner":
      resourceModel = new PractitionerModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case "PractitionerRole":
      resourceModel = new PractitionerRoleModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case "Procedure":
      resourceModel = new ProcedureModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    // case "Questionnaire":
    //   resourceModel = new QuestionnaireModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    // break
    // case "QuestionnaireResponse":
    //   resourceModel = new QuestionnaireResponseModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    // break
    // case "ReferralRequest":
    //   resourceModel = new ReferralRequestModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    // break
    case "RelatedPerson":
      resourceModel = new RelatedPersonModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case "ResearchStudy":
      resourceModel = new ResearchStudyModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    // case "ResourceCategory":
    //   resourceModel = new ResourceCategoryModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    // break
    default: {
      throw new Error("Unknown resource data structure")
    }
  }

  //transfer data from wrapper to the display model.
  resourceModel.source_resource_id = fhirResourceWrapper.source_resource_id
  resourceModel.source_id = fhirResourceWrapper.source_id
  resourceModel.sort_title = fhirResourceWrapper.sort_title
  resourceModel.sort_date = fhirResourceWrapper.sort_date

  return resourceModel
}
