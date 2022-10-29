import {IClient} from '../interface';
import {FHIR401Client} from './base/fhir401_r4_client';
import {Source} from '../../models/database/source';
import {IDatabaseRepository} from '../../database/interface';
import {UpsertSummary} from '../../models/fasten/upsert-summary';
import {ClientConfig} from '../../models/client/client-config';

export class BlueButtonClient  extends FHIR401Client implements IClient {
  constructor(source: Source, clientConfig: ClientConfig) {
    super(source, clientConfig);
  }

  /**
   * BlueButton overrides the SyncAll function because Patient-everything operation is not available.
   * @param db
   * @constructor
   */
  async SyncAll(db: IDatabaseRepository): Promise<UpsertSummary> {
    const supportedResources: string[] = [
      "ExplanationOfBenefit",
      "Coverage",
    ]

    return this.SyncAllByResourceName(db, supportedResources)
  }
}
