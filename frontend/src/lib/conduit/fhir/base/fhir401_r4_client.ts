import {IClient, IResourceBundleEntryRaw, IResourceBundleRaw, IResourceRaw} from '../../interface';
import {BaseClient} from './base_client';
import {Source} from '../../../models/database/source';
import {IDatabaseRepository} from '../../../database/interface';
import {ResourceFhir} from '../../../models/database/resource_fhir';
import {UpsertSummary} from '../../../models/fasten/upsert-summary';
import {ClientConfig} from '../../../models/client/client-config';

export class FHIR401Client extends BaseClient implements IClient {

  //clients extending this class must validate fhirVersion matches using conformance/metadata url.
  fhirVersion = "4.0.1"

  // https://build.fhir.org/ig/HL7/US-Core/
  usCoreResources: string[] = [
    "AllergyIntolerance",
    //"Binary",
    "CarePlan",
    "CareTeam",
    "Condition",
    //"Coverage",
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
    //"PractitionerRole",
    "Procedure",
    //"Provenance",
    //"RelatedPerson",
    // "ServiceRequest",
    // "Specimen",
  ]

  constructor(source: Source, clientConfig: ClientConfig) {
    super(source, clientConfig);
  }

  /**
   * This function attempts to retrieve a Patient Bundle and sync all resources to the database
   * @param db
   * @constructor
   */
  public async SyncAll(db: IDatabaseRepository): Promise<UpsertSummary> {
    const bundle = await this.GetPatientBundle(this.source.patient)

    const wrappedResourceModels = await this.ProcessBundle(bundle)
    //todo, create the resources in dependency order

    return db.UpsertResources(wrappedResourceModels)

  }

  /**
   * If Patient-everything api endpoint is unavailable (SyncAll) this function can be used to search for each resource associated with a Patient
   * and sync them to the database.
   * @param db
   * @param resourceNames
   * @constructor
   */
  public async SyncAllByResourceName(db: IDatabaseRepository, resourceNames: string[]): Promise<UpsertSummary>{
    //Store the Patient
    const patientResource = await this.GetPatient(this.source.patient)

    const patientResourceFhir = new ResourceFhir()
    patientResourceFhir.source_id = this.source._id
    patientResourceFhir.source_resource_type = patientResource.resourceType
    patientResourceFhir.source_resource_id = patientResource.id
    patientResourceFhir.resource_raw = patientResource

    const upsertSummary = await db.UpsertResource(patientResourceFhir)

    //error map storage.
    let syncErrors = {}

    //Store all other resources.
    for(let resourceType of resourceNames) {

      try {
        let bundle = await this.GetResourceBundlePaginated(`${resourceType}?patient=${this.source.patient}`)
        let wrappedResourceModels = await this.ProcessBundle(bundle)
        let resourceUpsertSummary = await db.UpsertResources(wrappedResourceModels)

        upsertSummary.updatedResources = upsertSummary.updatedResources.concat(resourceUpsertSummary.updatedResources)
        upsertSummary.totalResources += resourceUpsertSummary.totalResources


        // check if theres any "extracted" resource references that we should sync as well
        let extractedResourceReferences = []
        extractedResourceReferences = wrappedResourceModels.reduce((previousVal, wrappedResource) => {
          return previousVal.concat(this.ExtractResourceReference(wrappedResource.source_resource_type, wrappedResource.resource_raw))
        }, extractedResourceReferences)


        if(extractedResourceReferences.length > 0 ){
          console.log("Extracted Resource References", extractedResourceReferences)

          let extractedResourceBundle = await this.GenerateResourceBundleFromResourceIds(extractedResourceReferences)
          let wrappedExtractedResourceBundle = await this.ProcessBundle(extractedResourceBundle)
          let extractedResourceUpsertSummary = await db.UpsertResources(wrappedExtractedResourceBundle)

          upsertSummary.updatedResources = upsertSummary.updatedResources.concat(extractedResourceUpsertSummary.updatedResources)
          upsertSummary.totalResources += extractedResourceUpsertSummary.totalResources
        }

      }
      catch (e) {
        console.error(`An error occurred while processing ${resourceType} bundle ${this.source.patient}`)
        syncErrors[resourceType] = e
        continue
      }
    }

    //TODO: correctly return newly inserted documents
    return upsertSummary
  }

  /**
   * Given a raw resource payload, this function will determine if there are references to other resources, and extract them if so
   * This is useful because search (by patient id) is disabled for certain resource types.
   * @param sourceResourceType
   * @param resourceRaw
   * @constructor
   */
  public ExtractResourceReference(sourceResourceType: string, resourceRaw): string[] {
    let resourceRefs = []

    switch (sourceResourceType) {
      case "CarePlan":
        // encounter can contain
        //- Encounter
        resourceRefs.push(resourceRaw.encounter?.reference)

        //author can contain
        //- Practitioner
        //- Organization
        //- Patient
        //- PractitionerRole
        //- CareTeam
        //- RelatedPerson
        resourceRefs.push(resourceRaw.author?.reference)


        //contributor can contain
        //- Practitioner
        //- Organization
        //- Patient
        //- PractitionerRole
        //- CareTeam
        //- RelatedPerson
        resourceRefs.push(resourceRaw.contributor?.reference)

        //careTeam can contain
        //- CareTeam
        resourceRefs.push(resourceRaw.careTeam?.reference)

        break;
      case "CareTeam":
        // encounter can contain
        //- Encounter
        resourceRefs.push(resourceRaw.encounter?.reference)

        //participant[x].member can contain
        //- Practitioner
        //- Organization
        //- Patient
        //- PractitionerRole
        //- CareTeam
        //- RelatedPerson
        //participant[x].onBehalfOf can contain
        //- Organization
        resourceRaw.participant?.map((participant) => {
          resourceRefs.push(participant.member?.reference)
          resourceRefs.push(participant.onBehalfOf?.reference)
        })

        //managingOrganization
        //- Organization
        resourceRaw.managingOrganization?.map((managingOrganization) => {
          resourceRefs.push(managingOrganization.reference)
        })
        break;
      case "Condition":
        // recorder can contain
        //- Practitioner
        //- PractitionerRole
        //- Patient
        //- RelatedPerson
        resourceRefs.push(resourceRaw.recorder?.reference)

        // asserter can contain
        //- Practitioner
        //- PractitionerRole
        //- Patient
        //- RelatedPerson
        resourceRefs.push(resourceRaw.asserter?.reference)

        break;
      case "DiagnosticReport":
        //basedOn[x] can contain
        //- CarePlan
        //- ImmunizationRecommendation
        //- MedicationRequest
        //- NutritionOrder
        //- ServiceRequest
        resourceRaw.basedOn?.map((basedOn) => {
          resourceRefs.push(basedOn.reference)
        })

        // performer[x] can contain
        //- Practitioner
        //- PractitionerRole
        //- Organization
        //- CareTeam
        resourceRaw.performer?.map((performer) => {
          resourceRefs.push(performer.reference)
        })
        break;
      case "DocumentReference":
        //author[x] can contain
        //- Practitioner
        //- Organization
        //- Patient
        //- PractitionerRole
        //- CareTeam
        //- Device
        resourceRaw.author?.map((author) => {
          resourceRefs.push(author.reference)
        })

        //authenticator can contain
        //- Practitioner
        //- Organization
        //- PractitionerRole
        resourceRefs.push(resourceRaw.authenticator?.reference)

        // custodian can contain
        //- Organization
        resourceRefs.push(resourceRaw.custodian?.reference)

        // relatesTo.target
        //- DocumentReference
        resourceRaw.relatesTo?.map((relatesTo) => {
          resourceRefs.push(relatesTo.target?.reference)
        })

        //content.attachment can contain
        //- Attachment
        break
      case "Encounter":
        // basedOn[x] can contain
        //- ServiceRequest
        resourceRaw.basedOn?.map((basedOn) => {
          resourceRefs.push(basedOn.reference)
        })

        //participant[x].individual can contain
        //- Practitioner
        //- PractitionerRole
        //- RelatedPerson
        resourceRaw.participant?.map((participant) => {
          resourceRefs.push(participant.individual?.reference)
        })

        //reasonReference[x] can contain
        //- Condition
        //- Procedure
        //- Observation
        //- ImmunizationRecommendation
        resourceRaw.reasonReference?.map((reasonReference) => {
          resourceRefs.push(reasonReference.reference)
        })

        //hospitalization.origin can contain
        //- Location
        //- Organization
        resourceRefs.push(resourceRaw.hospitalization?.origin?.reference)

        //hospitalization.destination can contain
        //- Location
        //- Organization
        resourceRefs.push(resourceRaw.hospitalization?.destination?.reference)

        //location[x].location can contain
        //- Location
        resourceRaw.location?.map((location) => {
          resourceRefs.push(location.location?.reference)
        })

        //serviceProvider can contain
        //- Organization
        resourceRefs.push(resourceRaw.serviceProvider?.reference)

        break
      case "Immunization":
        // location can contain
        //- Location
        resourceRefs.push(resourceRaw.location?.reference)

        // manufacturer can contain
        //- Organization
        resourceRefs.push(resourceRaw.manufacturer?.reference)

        //performer[x].actor can contain
        //- Practitioner | PractitionerRole | Organization
        resourceRaw.performer?.map((performer) => {
          resourceRefs.push(performer.actor?.reference)
        })

        //reasonReference[x] can contain
        //- Condition | Observation | DiagnosticReport
        resourceRaw.reasonReference?.map((reasonReference) => {
          resourceRefs.push(reasonReference.reference)
        })

        //protocolApplied[x].authority can contain
        //- Organization
        resourceRaw.protocolApplied?.map((protocolApplied) => {
          resourceRefs.push(protocolApplied.authority?.reference)
        })
        break
      case "Location":
        // managingOrganization can contain
        //- Organization
        resourceRefs.push(resourceRaw.managingOrganization?.reference)

        // partOf can contain
        //- Location
        resourceRefs.push(resourceRaw.partOf?.reference)

        break
      case "MedicationRequest":
        // reported.reportedReference can contain
        //- Practitioner
        //- Organization
        //- Patient
        //- PractitionerRole
        //- RelatedPerson
        resourceRefs.push(resourceRaw.reported?.reportedReference?.reference)

        // medication[x] can contain
        //- Medication
        resourceRefs.push(resourceRaw.reported?.reportedReference?.reference)

        // requester can contain
        //- Practitioner
        //- Organization
        //- Patient
        //- PractitionerRole
        //- RelatedPerson
        //- Device
        resourceRefs.push(resourceRaw.requester?.reference)

        // performer can contain
        //- Practitioner | PractitionerRole | Organization | Patient | Device | RelatedPerson | CareTeam
        resourceRefs.push(resourceRaw.performer?.reference)
        // recorder can contain
        //- Practitioner | PractitionerRole
        resourceRefs.push(resourceRaw.recorder?.reference)

        //TODO: reasonReference
        //TODO: basedOn
        //TODO: insurance

        // dispenseRequest.performer can contain
        //- Organization
        resourceRefs.push(resourceRaw.dispenseRequest?.performer?.reference)
        break
      case "Observation":
        //basedOn[x] can contain
        //- CarePlan | DeviceRequest | ImmunizationRecommendation | MedicationRequest | NutritionOrder | ServiceRequest
        resourceRaw.basedOn?.map((basedOn) => {
          resourceRefs.push(basedOn.reference)
        })

        // partOf[x] can contain
        //- MedicationAdministration | MedicationDispense | MedicationStatement | Procedure | Immunization | ImagingStudy
        resourceRaw.partOf?.map((partOf) => {
          resourceRefs.push(partOf.reference)
        })
        // performer[x] can contain
        //- Practitioner | PractitionerRole | Organization | CareTeam | Patient | RelatedPerson
        resourceRaw.performer?.map((performer) => {
          resourceRefs.push(performer.reference)
        })
        // device can contain
        //- Device | DeviceMetric
        resourceRefs.push(resourceRaw.device?.reference)

        break
      case "PractitionerRole":
        // practitioner can contain
        //- Practitioner
        resourceRefs.push(resourceRaw.practitioner?.reference)

        //organization can contain
        //- Organization
        resourceRefs.push(resourceRaw.organization?.reference)

        //location can contain
        //- Location
        resourceRefs.push(resourceRaw.location?.reference)

        //TODO: healthcareService
        //TODO: endpoint
        break
      case "ServiceRequest":
        // basedOn[x] can contain
        //- CarePlan | ServiceRequest | MedicationRequest
        resourceRaw.basedOn?.map((basedOn) => {
          resourceRefs.push(basedOn.reference)
        })

        //requester can contain
        //- Practitioner
        //- Organization
        //- Patient
        //- PractitionerRole
        //- RelatedPerson
        //- Device
        resourceRefs.push(resourceRaw.requester?.reference)

        //performer[x] can contain
        //- Practitioner | PractitionerRole | Organization | CareTeam | HealthcareService | Patient | Device | RelatedPerson
        resourceRaw.performer?.map((performer) => {
          resourceRefs.push(performer.reference)
        })

        //locationReference[x] an contain
        //-Location
        resourceRaw.locationReference?.map((locationReference) => {
          resourceRefs.push(locationReference.reference)
        })

        //reasonReference[x] can contain
        //-Condition
        //-Observation
        //-DiagnosticReport
        //-DocumentReference
        resourceRaw.reasonReference?.map((reasonReference) => {
          resourceRefs.push(reasonReference.reference)
        })

        //insurance[x] can contain
        //- Coverage | ClaimResponse
        resourceRaw.insurance?.map((insurance) => {
          resourceRefs.push(insurance.reference)
        })
        break
    }

    // remove all null values, remove all duplicates
    let cleanResourceRefs = resourceRefs.filter(i => !(typeof i === 'undefined' || i === null));
    cleanResourceRefs = [...new Set(cleanResourceRefs)]
    return cleanResourceRefs
  }

  /**
   * This function is used to sync all resources from a Bundle file. Not applicable to this Client
   * @param db
   * @param bundleFile
   * @constructor
   */
  public async SyncAllFromBundleFile(db: IDatabaseRepository, bundleFile: any): Promise<UpsertSummary> {
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
        wrappedResourceModel.fhir_version = this.fhirVersion
        wrappedResourceModel.source_id = this.source._id
        wrappedResourceModel.source_resource_id = bundleEntry.resource.id
        wrappedResourceModel.source_resource_type = bundleEntry.resource.resourceType
        wrappedResourceModel.resource_raw = bundleEntry.resource
        // TODO find a way to safely/consistently get the resource updated date (and other metadata) which shoudl be added to the model.
        // wrappedResourceModel.updated_at = bundleEntry.resource.meta?.lastUpdated
        return wrappedResourceModel
      })
  }

  /**
   * Given a list of resource ids (Patient/xxx, Observation/yyyy), request these resources and generate a pseudo-bundle file
   * @param resourceIds
   * @constructor
   * @protected
   */
  protected async GenerateResourceBundleFromResourceIds(resourceIds: string[]): Promise<IResourceBundleRaw>{

    resourceIds = [...new Set(resourceIds)] //make sure they are unique references.
    let rawResourceRefs = await Promise.all(resourceIds.map(async (extractedResourceRef) => {
      return {
        resource: await this.GetRequest(extractedResourceRef) as IResourceRaw
      } as IResourceBundleEntryRaw
    }))

    return {resourceType: "Bundle", entry: rawResourceRefs}
  }

  /**
   * Retrieve a resource bundle. While "next" link is present in response, continue to request urls and append BundleEntries
   * @param relativeResourcePath
   * @constructor
   * @private
   */
  protected async GetResourceBundlePaginated(relativeResourcePath: string): Promise<IResourceBundleRaw> {
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

  /////////////////////////////////////////////////////////////////////////////
  // Private methods
  /////////////////////////////////////////////////////////////////////////////
}
