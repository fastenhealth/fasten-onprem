import {IClient} from '../interface';
import {FHIR401Client} from './base/fhir401_r4_client';
import {Source} from '../../models/database/source';
import {IDatabaseRepository} from '../../database/interface';

export class AthenaClient  extends FHIR401Client implements IClient {
  constructor(source: Source) {
    super(source);
  }

  /**
   * Athena overrides the SyncAll function because Patient-everything operation is not available.
   * @param db
   * @constructor
   */
  async SyncAll(db: IDatabaseRepository): Promise<string[]> {
    const supportedResources: string[] = [
      "AllergyIntolerance",
      //"Binary",
      "CarePlan",
      "CareTeam",
      "Condition",
      "Device",
      "DiagnosticReport",
      "DocumentReference",
      "Encounter",
      "Goal",
      "Immunization",
      //"Location",
      //"Medication",
      //"MedicationRequest",
      "Observation",
      //"Organization",
      //"Patient",
      //"Practitioner",
      "Procedure",
      //"Provenance",
    ]

    return this.SyncAllByResourceName(db, supportedResources)
  }
}
