import {Source} from '../../app/models/database/source';
import {IDatabasePaginatedResponse, IDatabaseRecord, IDatabaseRepository} from './interface';
import * as PouchDB from 'pouchdb/dist/pouchdb';
// import * as PouchDB from 'pouchdb';
import {DocType} from './constants';

export function NewRepositiory(databaseName: string = 'fasten'): IDatabaseRepository {
  return new PouchdbRepository(databaseName)
}

class PouchdbRepository implements IDatabaseRepository {

  localPouchDb: PouchDB.Database
  constructor(public databaseName: string) {
    this.localPouchDb = new PouchDB(databaseName);
  }
  public Close(): void {
    return
  }

  public async CreateSource(source: Source): Promise<string> {
    return this.createRecord(source);
  }

  public async GetSource(source_id: string): Promise<Source> {
    return this.getRecord(source_id)
      .then((record) => {
        return new Source(record)
      })
  }

  public async GetSources(): Promise<IDatabasePaginatedResponse> {
    return this.findRecordByDocType(DocType.Source)
      .then((recordsWrapper) => {

        recordsWrapper.rows = recordsWrapper.rows.map((record) => {
          return new Source(record.doc)
        })
        return recordsWrapper
      })
  }

  public async DeleteSource(source_id: string): Promise<boolean> {
    return this.deleteRecord(source_id)
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

  // create a new record. Returns a promise of the generated id.
  private createRecord(record: IDatabaseRecord) : Promise<string> {
    // make sure we always "populate" the ID for every record before submitting
    record.populateId()

    // NOTE: All friends are given the key-prefix of "friend:". This way, when we go
    // to query for friends, we can limit the scope to keys with in this key-space.
    return this.GetDB()
      .put(record)
      .then(( result ): string => {
          return( result.id );
        }
      );
  }

  private getRecord(id: string): Promise<any> {
    return this.GetDB()
      .get(id)
  }

  private findRecordByDocType(docType: DocType, includeDocs: boolean = true): Promise<IDatabasePaginatedResponse> {
    return this.GetDB()
      .allDocs({
        include_docs: includeDocs,
        startkey: `${docType}:`,
        endkey: `${docType}:\uffff`
      })
  }

  private async deleteRecord(id: string): Promise<boolean> {
    const recordToDelete = await this.getRecord(id)
    return this.GetDB()
      .remove(recordToDelete)
      .then((result) => {
        return result.ok
      })
  }

}
