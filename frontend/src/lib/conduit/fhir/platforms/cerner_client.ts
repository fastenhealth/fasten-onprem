import {IClient} from '../../interface';
import {FHIR401Client} from '../base/fhir401_r4_client';
import {Source} from '../../../models/database/source';
import {IDatabaseRepository} from '../../../database/interface';
import {UpsertSummary} from '../../../models/fasten/upsert-summary';
import {ClientConfig} from '../../../models/client/client-config';

export class CernerClient  extends FHIR401Client implements IClient {
  constructor(source: Source, clientConfig: ClientConfig) {
    super(source, clientConfig);
    //Cerner API requires the following Accept header for every request
    this.headers.set("Accept","application/json+fhir")
  }

  /**
   * Cerner overrides the SyncAll function because Patient-everything operation is not available.
   * @param db
   * @constructor
   */
  async SyncAll(db: IDatabaseRepository): Promise<UpsertSummary> {
    const supportedResources: string[] = this.usCoreResources.concat([
      "Account",
      "Appointment",
      "Consent",
      "FamilyMemberHistory",
      "InsurancePlan",
      "MedicationRequest",
      "NutritionOrder",
      "Person",
      "Provenance",
      "Questionnaire",
      "QuestionnaireResponse",
      "RelatedPerson",
      "Schedule",
      "ServiceRequest",
      "Slot",
    ])

    return this.SyncAllByResourceName(db, supportedResources)
  }
}
