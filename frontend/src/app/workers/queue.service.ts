import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {fromWorker} from 'observable-webworker';
import {Source} from '../../lib/models/database/source';
import {SourceSyncMessage} from '../models/queue/source-sync-message';
import {ToastService} from '../services/toast.service';
import {ToastNotification, ToastType} from '../models/fasten/toast';
import {FastenDbService} from '../services/fasten-db.service';

@Injectable({
  providedIn: 'root'
})
export class QueueService {

  constructor(private toastService: ToastService, private fastenDbService: FastenDbService) { }

  runSourceSyncWorker(source: Source):Observable<string> {
    if (typeof Worker !== 'undefined') {
      const sourceSync = new SourceSyncMessage()
      sourceSync.source = source
      sourceSync.current_user = this.fastenDbService.current_user
      const input$: Observable<string> = of(JSON.stringify(sourceSync));
      return fromWorker<string, string>(() => new Worker(new URL('./source-sync.worker', import.meta.url), {type: 'module'}), input$)
        // .subscribe(message => {
        //   console.log(`Got message`, message);
        // });
    }else {
      // Web workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
      console.error("WORKERS ARE NOT SUPPORTED")

      const toastNotificaiton = new ToastNotification()
      toastNotificaiton.type = ToastType.Error
      toastNotificaiton.message = "Your browser does not support web-workers. Cannot continue."
      toastNotificaiton.autohide = false
      this.toastService.show(toastNotificaiton)
    }

  }
}
