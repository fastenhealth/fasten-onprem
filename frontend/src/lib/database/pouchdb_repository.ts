import {Source} from '../models/database/source';
import {IDatabasePaginatedResponse, IDatabaseDocument, IDatabaseRepository} from './interface';
import {DocType} from './constants';
import {ResourceFhir} from '../models/database/resource_fhir';
import {ResourceTypeCounts, SourceSummary} from '../models/fasten/source-summary';
import {Base64} from '../utils/base64';

// PouchDB & plugins
import * as PouchDB from 'pouchdb/dist/pouchdb';
import * as PouchCrypto from 'crypto-pouch';
import {PouchdbUpsert} from './plugins/upsert';
import {UpsertSummary} from '../models/fasten/upsert-summary';
PouchDB.plugin(PouchCrypto);



// !!!!!!!!!!!!!!!!WARNING!!!!!!!!!!!!!!!!!!!!!
// most pouchdb plugins seem to fail when used in a webworker.
// !!!!!!!!!!!!!!!!WARNING!!!!!!!!!!!!!!!!!!!!!
// import * as PouchUpsert from 'pouchdb-upsert';
// PouchDB.plugin(PouchUpsert);
// import find from 'pouchdb-find';
// PouchDB.plugin(find);
// PouchDB.debug.enable('pouchdb:find')

// import * as rawUpsert from 'pouchdb-upsert';
// const upsert: PouchDB.Plugin = (rawUpsert as any);
// PouchDB.plugin(upsert);

// import {PouchdbUpsert} from './plugins/upsert';
// const upsert = new PouchdbUpsert()
// console.log("typeof PouchdbUpsert",typeof upsert, upsert)
// PouchDB.plugin(upsert.default)

// YOU MUST USE globalThis not window or self.
// YOU MUST NOT USE console.* as its not available in a webworker context


// this is required, otherwise PouchFind fails when looking for the global PouchDB variable

/**
 * This method is used to initialize the repository from Workers.
 * Eventually this method should dyanmically dtermine the version of the repo to return from the env.
 * @constructor
 */
export function NewRepositiory(userIdentifier?: string, encryptionKey?: string, localPouchDb?: PouchDB.Database): IDatabaseRepository {
  return new PouchdbRepository(userIdentifier, encryptionKey, localPouchDb)
}

export class PouchdbRepository implements IDatabaseRepository {

  // replicationHandler: any
  remotePouchEndpoint: string // "http://localhost:5984"
  encryptionKey: string
  pouchDb: PouchDB.Database

  /**
   * This class can be initialized in 2 states
   * - unauthenticated
   * - authenticated - determined using cookie and localStorage.current_user
   * @param userIdentifier
   * @param encryptionKey
   */
  constructor(userIdentifier?: string, encryptionKey?: string, localPouchDb?: PouchDB.Database) {
    this.remotePouchEndpoint = `${globalThis.location.protocol}//${globalThis.location.host}${this.getBasePath()}/database`

    //setup PouchDB Plugins
     //https://pouchdb.com/guides/mango-queries.html
    this.pouchDb = null
    if(userIdentifier){
      this.pouchDb = new PouchDB(this.getRemoteUserDb(userIdentifier));
      this.encryptionKey = encryptionKey
      // this.enableSync(userIdentifier)
    }
    if(localPouchDb){
      console.warn("using local pouchdb, this should only be used for testing")
      this.pouchDb = localPouchDb
    }
  }


  // Teardown / deconfigure the existing database instance (if there is one).
  // --
  // CAUTION: Subsequent calls to .GetDB() will fail until a new instance is configured
  // with a call to .ConfigureForUser().
  public async Close(): Promise<void> {
    if (!this.pouchDb) {
      return;
    }
    // Stop remote replication for existing database
    // if(this.replicationHandler){
    //   this.replicationHandler.cancel()
    // }

    this.pouchDb.close();
    this.pouchDb = null;
    return
  }


  ///////////////////////////////////////////////////////////////////////////////////////
  // Source

  public async UpsertSource(source: Source): Promise<UpsertSummary> {
    return this.upsertDocument(source);
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

  public async UpsertResource(resource: ResourceFhir): Promise<UpsertSummary> {
    return this.upsertDocument(resource);
  }

  public async UpsertResources(resources: ResourceFhir[]): Promise<UpsertSummary> {
    return this.upsertBulk(resources);
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
  public async GetDB(): Promise<PouchDB.Database> {
    if(!this.pouchDb) {
      throw(new Error( "Database is not available - please configure an instance." ));
    }
    // if(this.encryptionKey){
    //   return this.pouchDb.crypto(this.encryptionKey, {ignore:[
    //     'doc_type',
    //     'source_id',
    //     'source_resource_type',
    //     'source_resource_id',
    //   ]}).then(() => {
    //     return this.pouchDb
    //   })
    // } else {
      return this.pouchDb;
    // }
  }


  // update/insert a new document. Returns a promise of the generated id.
  protected upsertDocument(newDoc: IDatabaseDocument) : Promise<UpsertSummary> {
    // make sure we always "populate" the ID for every document before submitting
    newDoc.populateId()

    // NOTE: All friends are given the key-prefix of "friend:". This way, when we go
    // to query for friends, we can limit the scope to keys with in this key-space.

    return this.GetDB()
      .then((db) => {
        return PouchdbUpsert.upsert(db, newDoc._id, (existingDoc: IDatabaseDocument) => {
          //diffFunc - function that takes the existing doc as input and returns an updated doc.
          // If this diffFunc returns falsey, then the update won't be performed (as an optimization).
          // If the document does not already exist, then {} will be the input to diffFunc.

          const isExistingEmpty = Object.keys(existingDoc).length === 0
          if(isExistingEmpty){
            //always return new doc (and set update_at if not already set)
            //if this is a ResourceFhir doc, see if theres a updatedDate already
            if(newDoc.doc_type == DocType.ResourceFhir){
              newDoc.updated_at = newDoc.updated_at || (newDoc as any).meta?.updated_at
            }
            newDoc.updated_at = newDoc.updated_at || (new Date().toISOString())
            return newDoc
          }

          if(newDoc.doc_type == DocType.ResourceFhir){

            //for resourceFhir docs, we only care about comparing the resource_raw content
            const existingContent = JSON.stringify((existingDoc as ResourceFhir).resource_raw)
            const newContent = JSON.stringify((newDoc as ResourceFhir).resource_raw)
            if(existingContent == newContent){
              return false //do not update
            } else {
              //theres a difference. Set the updated_at date if possible, otherwise use the current date
              (newDoc as ResourceFhir).updated_at = (newDoc as any).meta?.updated_at || (new Date().toISOString())
              return newDoc
            }

          } else if(newDoc.doc_type == DocType.Source){
            delete existingDoc._rev
            const existingContent = JSON.stringify(existingDoc)
            const newContent = JSON.stringify(newDoc)
            if(existingContent == newContent){
              return false //do not update, content is the same for source object
            } else {
              //theres a difference. Set the updated_at date
              (newDoc as Source).updated_at = (new Date().toISOString())
              return { ...existingDoc, ...newDoc };
            }


          } else {
            throw new Error("unknown doc_type, cannot diff for upsert: " + newDoc.doc_type)
          }
        })

      })
      .then(( result ): UpsertSummary => {
        // // success, res is {rev: '1-xxx', updated: true, id: 'myDocId'}
        const updateSummary = new UpsertSummary()
        updateSummary.totalResources = 1

        if(result.updated){
            updateSummary.updatedResources = [result.id]
        }
        return updateSummary;
      });
  }

  protected upsertBulk(docs: IDatabaseDocument[]): Promise<UpsertSummary> {
    return Promise.all(docs.map((doc) => {
      doc.populateId();
      return this.upsertDocument(doc)
    })).then((results) => {
      return results.reduce((prev, current ) => {
        prev.totalResources += current.totalResources
        prev.updatedResources = prev.updatedResources.concat(current.updatedResources)
        return prev
      }, new UpsertSummary())
    })
  }

  protected getDocument(id: string): Promise<any> {
    return this.GetDB()
      .then((db) => db.get(id))
  }


  protected findDocumentByDocType(docType: DocType, includeDocs: boolean = true): Promise<IDatabasePaginatedResponse> {
    return this.findDocumentByPrefix(docType, includeDocs)
  }
  protected findDocumentByPrefix(prefix: string, includeDocs: boolean = true): Promise<IDatabasePaginatedResponse> {
    return this.GetDB()
      .then((db) => {
        return db.allDocs({
          include_docs: includeDocs,
          startkey: `${prefix}:`,
          endkey: `${prefix}:\uffff`
        })
      })

  }

  protected async deleteDocument(id: string): Promise<boolean> {
    const docToDelete = await this.getDocument(id)
    return this.GetDB()
      .then((db) => db.remove(docToDelete))
      .then((result) => {
        return result.ok
      })
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  // Sync private/protected methods
  ///////////////////////////////////////////////////////////////////////////////////////
  protected getRemoteUserDb(username: string){
    return `${this.remotePouchEndpoint}/userdb-${this.toHex(username)}`
  }
  // protected enableSync(userIdentifier: string){
  //   this.replicationHandler = this.localPouchDb.sync(this.getRemoteUserDb(userIdentifier), {live: true, retry: true})
  //   return
  // }


  private toHex(s: string) {
    // utf8 to latin1
    s = unescape(encodeURIComponent(s))
    let h = ''
    for (let i = 0; i < s.length; i++) {
      h += s.charCodeAt(i).toString(16)
    }
    return h
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  // Helper methods
  ///////////////////////////////////////////////////////////////////////////////////////
  protected getBasePath(): string {
    return globalThis.location.pathname.split('/web').slice(0, 1)[0];
  }
}
