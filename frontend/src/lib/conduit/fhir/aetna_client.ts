import {IClient} from '../interface';
import {FHIR401Client} from './base/fhir401_r4_client';
import {Source} from '../../models/database/source';
import {IDatabaseRepository} from '../../database/interface';
import {UpsertSummary} from '../../models/fasten/upsert-summary';
import {ClientConfig} from '../../models/client/client-config';

export class AetnaClient  extends FHIR401Client implements IClient {
  constructor(source: Source, clientConfig: ClientConfig) {
    super(source, clientConfig);
  }

  /**
   * Aetna overrides the SyncAll function because Patient-everything operation uses a non-standard endpoint
   * @param db
   * @constructor
   */
  async SyncAll(db: IDatabaseRepository): Promise<UpsertSummary> {
    const bundle = await this.GetResourceBundlePaginated("Patient")

    const wrappedResourceModels = await this.ProcessBundle(bundle)
    //todo, create the resources in dependency order
    return await db.UpsertResources(wrappedResourceModels)
  }
}
