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
import {BinaryModel} from './resources/binary-model';
import {MediaModel} from './resources/media-model';
import {ExplanationOfBenefitModel} from './resources/explanation-of-benefit-model';

// import {BinaryModel} from './resources/binary-model';

export function fhirModelFactory(modelResourceType: ResourceType, fhirResourceWrapper: any, fhirVersion: fhirVersions = fhirVersions.R4, fastenOptions?: FastenOptions): FastenDisplayModel {

  let resourceModel: FastenDisplayModel
  switch (modelResourceType) {
    case ResourceType.AdverseEvent:
      resourceModel = new AdverseEventModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case ResourceType.AllergyIntolerance:
      resourceModel = new AllergyIntoleranceModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case ResourceType.Appointment:
      resourceModel = new AppointmentModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case ResourceType.Binary:
      resourceModel = new BinaryModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case ResourceType.CarePlan:
      resourceModel = new CarePlanModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case ResourceType.CareTeam:
      resourceModel = new CareTeamModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    // case ResourceType.Claim:
    //   resourceModel = new ClaimModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    // break
    // case ResourceType.ClaimResponse:
    //   resourceModel = new ClaimResponseModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    // break
    case ResourceType.Condition:
      resourceModel = new ConditionModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case ResourceType.Composition:
      resourceModel = new ConditionModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    // case ResourceType.Coverage":
    //   resourceModel = new CoverageModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    // break
    case ResourceType.Device:
      resourceModel = new DeviceModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case ResourceType.DiagnosticReport:
      resourceModel = new DiagnosticReportModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case ResourceType.DocumentReference:
      resourceModel = new DocumentReferenceModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case ResourceType.Encounter:
      resourceModel = new EncounterModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case ResourceType.ExplanationOfBenefit:
      resourceModel = new ExplanationOfBenefitModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    break
    // case ResourceType.FamilyMemberHistory:
    //   resourceModel = new FamilyMemberHistoryModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    //break
    case ResourceType.Goal:
      resourceModel = new GoalModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case ResourceType.Immunization:
      resourceModel = new ImmunizationModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case ResourceType.Location:
      resourceModel = new LocationModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case ResourceType.Media:
      resourceModel = new MediaModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case ResourceType.Medication:
      resourceModel = new MedicationModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    // case ResourceType.MedicationAdministration:
    //   resourceModel = new MedicationAdministrationModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    // break
    case ResourceType.MedicationDispense:
      resourceModel = new MedicationDispenseModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    // case ResourceType.MedicationKnowledge:
    //   resourceModel = new MedicationKnowledgeModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    // break
    // case ResourceType.MedicationOrder:
    //   resourceModel = new MedicationOrderModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    // break
    case ResourceType.MedicationRequest:
      resourceModel = new MedicationRequestModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    break
    // case ResourceType.MedicationStatement:
    //   resourceModel = new MedicationStatementModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    // break
    case ResourceType.Observation:
      resourceModel = new ObservationModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case ResourceType.Organization:
      resourceModel = new OrganizationModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case ResourceType.Patient:
      resourceModel = new PatientModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case ResourceType.Practitioner:
      resourceModel = new PractitionerModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case ResourceType.PractitionerRole:
      resourceModel = new PractitionerRoleModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case ResourceType.Procedure:
      resourceModel = new ProcedureModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    // case ResourceType.Questionnaire:
    //   resourceModel = new QuestionnaireModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    // break
    // case ResourceType.QuestionnaireResponse:
    //   resourceModel = new QuestionnaireResponseModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    // break
    // case ResourceType.ReferralRequest:
    //   resourceModel = new ReferralRequestModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    // break
    case ResourceType.RelatedPerson:
      resourceModel = new RelatedPersonModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    case ResourceType.ResearchStudy:
      resourceModel = new ResearchStudyModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
      break
    // case ResourceType.ResourceCategory:
    //   resourceModel = new ResourceCategoryModel(fhirResourceWrapper.resource_raw, fhirVersion, fastenOptions)
    // break
    default: {
      throw new Error("Ignoring Unknown resource data structure:" + modelResourceType)
    }
  }

  //transfer data from wrapper to the display model.
  resourceModel.source_resource_id = fhirResourceWrapper.source_resource_id
  resourceModel.source_id = fhirResourceWrapper.source_id
  resourceModel.sort_title = fhirResourceWrapper.sort_title
  resourceModel.sort_date = fhirResourceWrapper.sort_date

  return resourceModel
}
