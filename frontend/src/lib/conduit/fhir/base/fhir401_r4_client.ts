import {IClient, IResourceBundleRaw, IResourceRaw} from '../../interface';
import {BaseClient} from './base_client';
import {Source} from '../../../models/database/source';
import {IDatabaseRepository} from '../../../database/interface';
import {ResourceFhir} from '../../../models/database/resource_fhir';

export class FHIR401Client extends BaseClient implements IClient {

  //clients extending this class must validate fhirVersion matches using conformance/metadata url.
  fhirVersion = "4.0.1"

  constructor(source: Source) {
    super(source);
  }

  public async SyncAll(db: IDatabaseRepository): Promise<string[]> {
    const bundle = await this.GetPatientBundle(this.source.patient)

    const wrappedResourceModels = await this.ProcessBundle(bundle)
    //todo, create the resources in dependency order

    //TODO bulk insert
    // for(let dbModel of wrappedResourceModels){
    //   db.CreateResource(dbModel)
    // }
    console.log(wrappedResourceModels)
    return db.CreateResources(wrappedResourceModels)

  }

  public async SyncAllBundle(db: IDatabaseRepository, bundleFile: any): Promise<any> {
    return Promise.resolve(undefined);
  }

  /////////////////////////////////////////////////////////////////////////////
  // Protected methods
  /////////////////////////////////////////////////////////////////////////////
  protected async ProcessBundle(bundle: IResourceBundleRaw): Promise<ResourceFhir[]> {
    // console.log(bundle)
    // process each entry in bundle
    return bundle.entry
      .filter((bundleEntry) => {
        return bundleEntry.resource.id // keep this entry if it has an ID, skip otherwise.
      })
      .map((bundleEntry) => {
        const wrappedResourceModel = new ResourceFhir()
        wrappedResourceModel.source_id = this.source._id
        wrappedResourceModel.source_resource_id = bundleEntry.resource.id
        wrappedResourceModel.source_resource_type = bundleEntry.resource.resourceType
        wrappedResourceModel.resource_raw = bundleEntry.resource
        // TODO find a way to safely/consistently get the resource updated date (and other metadata) which shoudl be added to the model.
        // wrappedResourceModel.updated_at = bundleEntry.resource.meta?.lastUpdated
        return wrappedResourceModel
      })


  }

  /////////////////////////////////////////////////////////////////////////////
  // Private methods
  /////////////////////////////////////////////////////////////////////////////
}
