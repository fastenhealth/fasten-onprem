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

  /**
   * This function attempts to retrieve a Patient Bundle and sync all resources to the database
   * @param db
   * @constructor
   */
  public async SyncAll(db: IDatabaseRepository): Promise<string[]> {
    const bundle = await this.GetPatientBundle(this.source.patient)

    const wrappedResourceModels = await this.ProcessBundle(bundle)
    //todo, create the resources in dependency order

    return db.CreateResources(wrappedResourceModels)

  }

  /**
   * If Patient-everything api endpoint is unavailable (SyncAll) this function can be used to search for each resource associated with a Patient
   * and sync them to the database.
   * @param db
   * @param resourceNames
   * @constructor
   */
  public async SyncAllByResourceName(db: IDatabaseRepository, resourceNames: string[]): Promise<string[]>{
    //Store the Patient
    const patientResource = await this.GetPatient(this.source.patient)

    const patientResourceFhir = new ResourceFhir()
    patientResourceFhir.source_id = this.source._id
    patientResourceFhir.source_resource_type = patientResource.resourceType
    patientResourceFhir.source_resource_id = patientResource.id
    patientResourceFhir.resource_raw = patientResource

    await db.CreateResource(patientResourceFhir)

    //error map storage.
    let syncErrors = {}

    //Store all other resources.
    for(let resourceType of resourceNames) {

      try {
        let bundle = await this.GetResourceBundlePaginated(`${resourceType}?patient=${this.source.patient}`)
        let wrappedResourceModels = await this.ProcessBundle(bundle)

        for(let apiModel of wrappedResourceModels){
          await db.CreateResource(apiModel)
        }
      }
      catch (e) {
        console.error(`An error occurred while processing ${resourceType} bundle ${this.source.patient}`)
        syncErrors[resourceType] = e
        continue
      }
    }

    //TODO: correctly return newly inserted documents
    return []
  }

  /**
   * This function is used to sync all resources from a Bundle file. Not applicable to this Client
   * @param db
   * @param bundleFile
   * @constructor
   */
  public async SyncAllFromBundleFile(db: IDatabaseRepository, bundleFile: any): Promise<any> {
    return Promise.reject(new Error("not implemented"));
  }

  /////////////////////////////////////////////////////////////////////////////
  // Protected methods
  /////////////////////////////////////////////////////////////////////////////
  /**
   * This function attempts to retrieve the Patient Bundle using the Patient-everything api endpoint (if available)
   * This response may be paginated
   * https://hl7.org/fhir/operation-patient-everything.html
   * @param patientId
   * @constructor
   * @protected
   */
  protected GetPatientBundle(patientId: string): Promise<any> {
    return this.GetResourceBundlePaginated(`Patient/${patientId}/$everything`)
  }

  /**
   * This function retrieves a patient resource
   * @param patientId
   * @constructor
   * @protected
   */
  protected GetPatient(patientId: string): Promise<IResourceRaw> {
    return this.GetRequest(`Patient/${patientId}`)
  }

  /**
   * This function parses a FHIR Bundle and wraps each BundleEntry resource in a ResourceFhir object which can be stored in the DB.
   * @param bundle
   * @constructor
   * @protected
   */
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

  /**
   * Retrieve a resource bundle. While "next" link is present in response, continue to request urls and append BundleEntries
   * @param relativeResourcePath
   * @constructor
   * @private
   */
  private async GetResourceBundlePaginated(relativeResourcePath: string): Promise<IResourceBundleRaw> {
    // https://www.hl7.org/fhir/patient-operation-everything.html

    const bundle = await this.GetRequest(relativeResourcePath) as IResourceBundleRaw

    let next: string
    let prev: string
    let self: string
    for(let link of bundle.link || []){
      if(link.relation == "next"){
        next = link.url
      } else if(link.relation == "self"){
        self = link.url
      } else if(link.relation == "previous"){
        prev = link.url
      }
    }

    while(next && next != self && next != prev){
      console.debug(`Paginated request => ${next}`)
      let nextBundle = await this.GetRequest(next) as IResourceBundleRaw
      bundle.entry = bundle.entry.concat(nextBundle.entry)

      next = "" //reset the pointers
      self = ""
      prev = ""
      for(let link of nextBundle.link){
        if(link.relation == "next"){
          next = link.url
        } else if(link.relation == "self"){
          self = link.url
        } else if(link.relation == "previous"){
          prev = link.url
        }
      }
    }

    return bundle
  }
}
