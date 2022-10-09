import {Source} from '../models/database/source';
import {IDatabasePaginatedResponse, IDatabaseDocument, IDatabaseRepository} from './interface';
import {DocType} from './constants';
import {ResourceFhir} from '../models/database/resource_fhir';
import {ResourceTypeCounts, SourceSummary} from '../models/fasten/source-summary';
import {Base64} from '../utils/base64';

// PouchDB & plugins
import * as PouchDB from 'pouchdb/dist/pouchdb';
import * as PouchCrypto from 'crypto-pouch';
PouchDB.plugin(PouchCrypto);

// !!!!!!!!!!!!!!!!WARNING!!!!!!!!!!!!!!!!!!!!!
// most pouchdb plugins seem to fail when used in a webworker.
// !!!!!!!!!!!!!!!!WARNING!!!!!!!!!!!!!!!!!!!!!
// import * as PouchUpsert from 'pouchdb-upsert';
// PouchDB.plugin(PouchUpsert);
// import find from 'pouchdb-find';
// PouchDB.plugin(find);
// PouchDB.debug.enable('pouchdb:find')


// this is required, otherwise PouchFind fails when looking for the global PouchDB variable

/**
 * This method is used to initialize the repository from Workers.
 * Eventually this method should dyanmically dtermine the version of the repo to return from the env.
 * @constructor
 */
export function NewRepositiory(userIdentifier?: string): IDatabaseRepository {
  return new PouchdbRepository(userIdentifier)
}

export class PouchdbRepository implements IDatabaseRepository {



  localPouchDb: PouchDB.Database
  constructor(userIdentifier?: string) {
    //setup PouchDB Plugins
     //https://pouchdb.com/guides/mango-queries.html
    this.localPouchDb = null
    if(userIdentifier){
      this.localPouchDb = new PouchDB(userIdentifier);
    }
  }


  // Teardown / deconfigure the existing database instance (if there is one).
  // --
  // CAUTION: Subsequent calls to .GetDB() will fail until a new instance is configured
  // with a call to .ConfigureForUser().
  public async Close(): Promise<void> {
    if (!this.localPouchDb) {
      return;
    }
    this.localPouchDb.close();
    this.localPouchDb = null;
    return
  }


  ///////////////////////////////////////////////////////////////////////////////////////
  // Source

  public async CreateSource(source: Source): Promise<string> {
    return this.createDocument(source);
  }

  public async GetSource(source_id: string): Promise<Source> {
    return this.getDocument(source_id)
      .then((doc) => {
        return new Source(doc)
      })
  }

  public async GetSources(): Promise<IDatabasePaginatedResponse> {
    return this.findDocumentByDocType(DocType.Source)
      .then((docWrapper) => {

        docWrapper.rows = docWrapper.rows.map((result) => {
          return new Source(result.doc)
        })
        return docWrapper
      })
  }

  public async GetSourceSummary(source_id: string): Promise<SourceSummary> {
    const sourceSummary = new SourceSummary()
    sourceSummary.source = await this.GetSource(source_id)
    sourceSummary.patient = await this.findDocumentByPrefix(`${DocType.ResourceFhir}:${Base64.Encode(source_id)}:Patient`, true)
      .then((paginatedResp) => new ResourceFhir(paginatedResp?.rows[0].doc))

    sourceSummary.resource_type_counts = await this.findDocumentByPrefix(`${DocType.ResourceFhir}:${Base64.Encode(source_id)}`, false)
      .then((paginatedResp) => {
        const lookup: {[name: string]: ResourceTypeCounts} = {}
        paginatedResp?.rows.forEach((resourceWrapper) => {
          const resourceIdParts = resourceWrapper.id.split(':')
          const resourceType = resourceIdParts[2]

          let currentResourceStats = lookup[resourceType] || {
            count: 0,
            source_id: Base64.Decode(resourceIdParts[1]),
            resource_type: resourceType
          }
          currentResourceStats.count += 1
          lookup[resourceType] = currentResourceStats
        })

        const arr = []
        for(let key in lookup){
          arr.push(lookup[key])
        }
        return arr
      })
    return sourceSummary
  }

  public async DeleteSource(source_id: string): Promise<boolean> {
    return this.deleteDocument(source_id)
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  // Resource

  public async CreateResource(resource: ResourceFhir): Promise<string> {
    return this.createDocument(resource);
  }

  public async CreateResources(resources: ResourceFhir[]): Promise<string[]> {
    return this.createBulk(resources);
  }

  public async GetResource(resource_id: string): Promise<ResourceFhir> {
    return this.getDocument(resource_id)
      .then((doc) => {
        return new ResourceFhir(doc)
      })
  }

  public async GetResources(): Promise<IDatabasePaginatedResponse> {
    return this.findDocumentByDocType(DocType.ResourceFhir)
      .then((docWrapper) => {

        docWrapper.rows = docWrapper.rows.map((result) => {
          return new ResourceFhir(result.doc)
        })
        return docWrapper
      })
  }

  public async GetResourcesForSource(source_id: string, source_resource_type?: string): Promise<IDatabasePaginatedResponse> {
    let prefix = `${DocType.ResourceFhir}:${Base64.Encode(source_id)}`
    if(source_resource_type){
      prefix += `:${source_resource_type}`
    }

    return this.findDocumentByPrefix(prefix, true)
      .then((docWrapper) => {

        docWrapper.rows = docWrapper.rows.map((result) => {
          return new ResourceFhir(result.doc)
        })
        return docWrapper
      })
  }



  ///////////////////////////////////////////////////////////////////////////////////////
  // CRUD Operators
  // All functions below here will return the raw PouchDB responses, and may need to be wrapped in
  // new ResourceFhir(result.doc)
  ///////////////////////////////////////////////////////////////////////////////////////

  // Get the active PouchDB instance. Throws an error if no PouchDB instance is
  // available (ie, user has not yet been configured with call to .configureForUser()).
  public GetDB(): any {
    if(!this.localPouchDb) {
      throw(new Error( "Database is not available - please configure an instance." ));
    }
    return this.localPouchDb;
  }

  // create a new document. Returns a promise of the generated id.
  protected createDocument(doc: IDatabaseDocument) : Promise<string> {
    // make sure we always "populate" the ID for every document before submitting
    doc.populateId()

    // NOTE: All friends are given the key-prefix of "friend:". This way, when we go
    // to query for friends, we can limit the scope to keys with in this key-space.
    return this.GetDB()
      .put(doc)
      .then(( result ): string => {
          return( result.id );
        }
      );
  }

  // create multiple documents, returns a list of generated ids
  protected createBulk(docs: IDatabaseDocument[]): Promise<string[]> {
    return this.GetDB()
      .bulkDocs(docs.map((doc) => { doc.populateId(); return doc }))
      .then((results): string[] => {
        return results.map((result) => result.id)
      })
  }

  protected getDocument(id: string): Promise<any> {
    return this.GetDB()
      .get(id)
  }


  protected findDocumentByDocType(docType: DocType, includeDocs: boolean = true): Promise<IDatabasePaginatedResponse> {
    return this.findDocumentByPrefix(docType, includeDocs)
  }
  protected findDocumentByPrefix(prefix: string, includeDocs: boolean = true): Promise<IDatabasePaginatedResponse> {
    return this.GetDB()
      .allDocs({
        include_docs: includeDocs,
        startkey: `${prefix}:`,
        endkey: `${prefix}:\uffff`
      })
  }

  protected async deleteDocument(id: string): Promise<boolean> {
    const docToDelete = await this.getDocument(id)
    return this.GetDB()
      .remove(docToDelete)
      .then((result) => {
        return result.ok
      })
  }

}
