import { Injectable } from '@angular/core';
import {Source} from '../models/database/source';
// import * as PouchDB from 'pouchdb';
import * as PouchDB from 'pouchdb/dist/pouchdb';
@Injectable({
  providedIn: 'root'
})
export class FastenDbService {

  localPouchDb: PouchDB.Database
  constructor() {
    this.localPouchDb = new PouchDB('kittens');
  }


  async createSource(source: Source): Promise<string> {
    return this.createRecord(source);
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  // CRUD Operators
  ///////////////////////////////////////////////////////////////////////////////////////

  // Get the active PouchDB instance. Throws an error if no PouchDB instance is
  // available (ie, user has not yet been configured with call to .configureForUser()).
  public getDB(): any {
    if(!this.localPouchDb) {
      throw( new Error( "Database is not available - please configure an instance." ) );
    }
    return this.localPouchDb;
  }

  // create a new record. Returns a promise of the generated id.
  private createRecord(record: Source) : Promise<string> {
    // make sure we always "populate" the ID for every record before submitting
    record.populateId()

    // NOTE: All friends are given the key-prefix of "friend:". This way, when we go
    // to query for friends, we can limit the scope to keys with in this key-space.
    return this.getDB()
      .put(record)
      .then(( result ): string => {
          return( result.id );
        }
      );
  }

  //public only for testing
  public getRecord(id: string): Promise<any> {
    return this.getDB()
      .get(id)
  }

}
