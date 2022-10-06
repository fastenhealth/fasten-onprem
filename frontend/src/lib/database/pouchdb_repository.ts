import {Source} from '../models/database/source';
import {IDatabasePaginatedResponse, IDatabaseDocument, IDatabaseRepository} from './interface';
import * as PouchDB from 'pouchdb/dist/pouchdb';
// import * as PouchDB from 'pouchdb';
import {DocType} from './constants';
import {ResourceFhir} from '../models/database/resource_fhir';

export function NewRepositiory(databaseName: string = 'fasten'): IDatabaseRepository {
  return new PouchdbRepository(databaseName)
}

export class PouchdbRepository implements IDatabaseRepository {

  localPouchDb: PouchDB.Database
  constructor(public databaseName: string) {
    this.localPouchDb = new PouchDB(databaseName);
  }
  public Close(): void {
    return
  }

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

  public async DeleteSource(source_id: string): Promise<boolean> {
    return this.deleteDocument(source_id)
  }

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


  ///////////////////////////////////////////////////////////////////////////////////////
  // CRUD Operators
  ///////////////////////////////////////////////////////////////////////////////////////

  // Get the active PouchDB instance. Throws an error if no PouchDB instance is
  // available (ie, user has not yet been configured with call to .configureForUser()).
  public GetDB(): any {
    if(!this.localPouchDb) {
      throw( new Error( "Database is not available - please configure an instance." ) );
    }
    return this.localPouchDb;
  }

  // create a new document. Returns a promise of the generated id.
  private createDocument(doc: IDatabaseDocument) : Promise<string> {
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
  private createBulk(docs: IDatabaseDocument[]): Promise<string[]> {
    return this.GetDB()
      .bulkDocs(docs.map((doc) => { doc.populateId(); return doc }))
      .then((results): string[] => {
        return results.map((result) => result.id)
      })
  }

  private getDocument(id: string): Promise<any> {
    return this.GetDB()
      .get(id)
  }

  private findDocumentByDocType(docType: DocType, includeDocs: boolean = true): Promise<IDatabasePaginatedResponse> {
    return this.GetDB()
      .allDocs({
        include_docs: includeDocs,
        startkey: `${docType}:`,
        endkey: `${docType}:\uffff`
      })
  }

  private async deleteDocument(id: string): Promise<boolean> {
    const docToDelete = await this.getDocument(id)
    return this.GetDB()
      .remove(docToDelete)
      .then((result) => {
        return result.ok
      })
  }

}
