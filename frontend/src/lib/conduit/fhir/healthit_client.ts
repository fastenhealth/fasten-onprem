import {IClient} from '../interface';
import {FHIR401Client} from './base/fhir401_r4_client';
import {Source} from '../../models/database/source';
import {IDatabaseRepository} from '../../database/interface';

export class HealthITClient  extends FHIR401Client implements IClient {
  constructor(source: Source) {
    super(source);
    //HealthIT API requires the following Accept header for every request
    this.headers.set("Accept","application/json+fhir")
  }

  /**
   * HealthIT overrides the SyncAll function because Patient-everything operation is not available.
   * @param db
   * @constructor
   */
  async SyncAll(db: IDatabaseRepository): Promise<string[]> {
    const supportedResources: string[] = [
      "AllergyIntolerance",
      "CarePlan",
      "CareTeam",
      "Condition",
      "Consent",
      "Device",
      "Encounter",
      "FamilyMemberHistory",
      "Goal",
      "Immunization",
      "InsurancePlan",
      "MedicationRequest",
      "NutritionOrder",
      "Observation",
      "Person",
      "Procedure",
      "Provenance",
      "Questionnaire",
      "QuestionnaireResponse",
      "RelatedPerson",
      "Schedule",
      "ServiceRequest",
      "Slot",
    ]

    return this.SyncAllByResourceName(db, supportedResources)
  }
}
