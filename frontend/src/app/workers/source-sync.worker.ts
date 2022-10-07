/// <reference lib="webworker" />



// addEventListener('message', ({ data }) => {
//   const response = `worker response to ${data}`;
//   postMessage(response);
// });
//

import {DoWork, runWorker} from 'observable-webworker';
import {from, Observable} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';
import {SourceSyncMessage} from '../models/queue/source-sync-message';
import {NewClient} from '../../lib/conduit/factory';
import {NewRepositiory} from '../../lib/database/pouchdb_repository';

export class SourceSyncWorker implements DoWork<string, string> {
  public work(input$: Observable<string>): Observable<string> {
    return input$.pipe(
      //mergeMap allows us to convert a promise into an observable
      // https://stackoverflow.com/questions/53649294/how-to-handle-for-promise-inside-a-piped-map
      mergeMap(msg => {
        console.log(msg); // outputs 'Hello from main thread'
        const sourceSyncMessage = JSON.parse(msg) as SourceSyncMessage

        // const fastenDB = new PouchDB('kittens');
        // fastenDB.get("source_bluebutton_6966c695-1c15-46df-9247-e09f00688b0f")
        //   .then(console.log)
        //   .then(() => {console.log("PREVIOUS MESSAGE WAS FROM WORKER")})
        const db = NewRepositiory(sourceSyncMessage.database_name)
        const client = NewClient(sourceSyncMessage.source.source_type, sourceSyncMessage.source)
        console.log("!!!!!!!!!!!!!!STARTING WORKER SYNC!!!!!!!!!", sourceSyncMessage)
        return client.SyncAll(db)
          .then((resp) => {
            console.log("!!!!!!!!!!!!!COMPLETE WORKER SYNC!!!!!!!!!!", resp)
            // response$.
            return JSON.stringify(resp)

          })
          .catch((err) => {
            console.error("!!!!!!!!!!!!!ERROR WORKER SYNC!!!!!!!!!!", err)
            throw err
          })
        // return from(resp)

        // return JSON.stringify(sourceSyncMessage)
        // const sourceSyncUpdate = new SourceSyncMessage()
        // sourceSyncUpdate.type = SourceSyncMessageType.StatusUpdate
        // sourceSyncUpdate.message = `began processing source (${sourceSyncMessage.source.source_type}) in web-worker`
        // return sourceSyncUpdate
        // // return defer(() => {return promiseChain});
      }),
    );
  }
}

runWorker(SourceSyncWorker);
