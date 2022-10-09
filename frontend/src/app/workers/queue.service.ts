import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {fromWorker} from 'observable-webworker';
import {Source} from '../../lib/models/database/source';
import {SourceSyncMessage} from '../models/queue/source-sync-message';

@Injectable({
  providedIn: 'root'
})
export class QueueService {

  constructor() { }

  runSourceSyncWorker(source: Source):Observable<string> {
    if (typeof Worker !== 'undefined') {
      const sourceSync = new SourceSyncMessage()
      sourceSync.source = source
      sourceSync.userIdentifier = localStorage.getItem("current_user")
      const input$: Observable<string> = of(JSON.stringify(sourceSync));
      return fromWorker<string, string>(() => new Worker(new URL('./source-sync.worker', import.meta.url), {type: 'module'}), input$)
        // .subscribe(message => {
        //   console.log(`Got message`, message);
        // });
    }else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
      console.error("WORKERS ARE NOT SUPPORTED")
    }

  }
}
