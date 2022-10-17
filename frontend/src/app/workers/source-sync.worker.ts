/// <reference lib="webworker" />

import {DoWork, runWorker} from 'observable-webworker';
import {Observable} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import {SourceSyncMessage} from '../models/queue/source-sync-message';
import {NewPouchdbRepositoryWebWorker, PouchdbRepository} from '../../lib/database/pouchdb_repository';
import {NewClient} from '../../lib/conduit/factory';
import {Source} from '../../lib/models/database/source';

export class SourceSyncWorker implements DoWork<string, string> {
  public work(input$: Observable<string>): Observable<string> {
    return input$.pipe(
      //mergeMap allows us to convert a promise into an observable
      // https://stackoverflow.com/questions/53649294/how-to-handle-for-promise-inside-a-piped-map
      mergeMap(msg => {
        try {
          console.log(msg); // outputs 'Hello from main thread'
          const sourceSyncMessage = JSON.parse(msg) as SourceSyncMessage

          const db = NewPouchdbRepositoryWebWorker(sourceSyncMessage.current_user)
          const client = NewClient(sourceSyncMessage.source.source_type, new Source(sourceSyncMessage.source))
          //TODO: validate the FHIR version from the datasource matches the client
          // if the source token has been refreshed, we need to store it in the DB.
          // await db.UpsertSource()


          //lets refresh the source information if required.
          console.log("!!!!!!!!!!!!!!STARTING WORKER SYNC!!!!!!!!!", sourceSyncMessage)
          return client.RefreshSourceToken()
            .then((wasSourceRefreshed)=>{
              if(wasSourceRefreshed){
                //the source was updated, we need to save the updated source information
                return db.UpsertSource(client.source)
                  .then(() => {
                    return client
                  })
              }
              return client
            })
            .then((client)=> {
              return client.SyncAll(db)
            })
            .then((resp) => {
              console.log("!!!!!!!!!!!!!COMPLETE WORKER SYNC!!!!!!!!!!", resp)
              sourceSyncMessage.response = resp
              return JSON.stringify(sourceSyncMessage)

            })
            .catch((err) => {
              console.error("!!!!!!!!!!!!!ERROR WORKER SYNC!!!!!!!!!!", err)
              throw err
            })
          // return from(resp)

        } catch (e) {
          console.log("CAUGHT ERROR", e)
          console.trace(e)
          throw e
        }
      }),
    );
  }
}

runWorker(SourceSyncWorker);
