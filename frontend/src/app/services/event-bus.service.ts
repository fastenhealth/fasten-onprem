import {AfterViewInit, Injectable, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {AuthService} from './auth.service';
import {FastenApiService} from './fasten-api.service';
import {ToastService} from './toast.service';
import {Event} from '../models/events/event';
import {EventSourceComplete} from '../models/events/event_source_complete';
import {EventSourceSync} from '../models/events/event_source_sync';
import {GetEndpointAbsolutePath} from '../../lib/utils/endpoint_absolute_path';
import {environment} from '../../environments/environment';
import {fetchEventSource} from '@microsoft/fetch-event-source';

@Injectable({
  providedIn: 'root'
})
export class EventBusService {

  //stores a reference to the event stream observable, which we can listen to for events
  private eventBus: Observable<Event> | undefined;
  //stores a reference to the event bus abort controller, which we can use to abort the event bus connection
  private eventBusAbortController: AbortController | undefined;
  //stores a reference to the event bus observable subscription, which we can use to unsubscribe from the event bus
  private eventBusSubscription: Subscription | undefined;

  public SourceSyncMessages: Subject<EventSourceSync> = new Subject<EventSourceSync>();
  public SourceCompleteMessages: Subject<EventSourceComplete> = new Subject<EventSourceComplete>();

  constructor(
    public router: Router,
    public authService: AuthService,
    public toastService: ToastService
  ) {

    // Ideally we want consistently listen to events, but only when the user is authenticated.
    //TODO: find a way to abort the event bus connection.
    this.authService.IsAuthenticatedSubject.subscribe((isAuthenticated) => {
      if(isAuthenticated){
        this.eventBusSubscription = this.listenEventBus().subscribe((event: Event | EventSourceSync | EventSourceComplete)=>{
          //TODO: start toasts.
          if(event.event_type == "source_sync"){
            this.SourceSyncMessages.next(event as EventSourceSync)
          } else if(event.event_type == "source_complete"){
            this.SourceCompleteMessages.next(event as EventSourceComplete)
          }
        })
      } else {
        //no longer authenticated, unsubscribe from eventbus and abort/terminate connection
        this.abortEventBus()
      }
    });
  }

  //Make sure we an cancel the event bus connection & subscription, resetting to a clean state.
  abortEventBus() {
    if(this.eventBusAbortController){
      try {
        this.eventBusAbortController.abort()
      } catch (e) {
        console.log("ignoring, error aborting event bus:", e)
      }
    }
    if(this.eventBusSubscription){
      try {
        this.eventBusSubscription.unsubscribe()
      } catch (e) {
        console.log("ignoring, error unsubscribing from event bus:", e)
      }
    }

    this.eventBus = null
    this.eventBusAbortController = null
    this.eventBusSubscription = null
  }

  //Listen to the event bus, and return an observable that we can subscribe to.
  //this method uses the fetch-event-source library, which is a polyfill for the EventSource API (which does not support Authorization Headers)
  //
  listenEventBus(): Observable<any> {
    //this is a singleton, so if we already have an event bus, return it.

    if(this.eventBus){
      return this.eventBus
    }

    let serviceThis = this;
    let eventStreamUrl = `${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/events/stream`
    this.eventBusAbortController = new AbortController();
    this.eventBus = new Observable(observer => {
      fetchEventSource(eventStreamUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authService.GetAuthToken()}`
        },
        onmessage(ev) {
          observer.next(JSON.parse(ev.data));
        },
        onerror(event) {
          observer.error(event)
          //don't retry, just close the stream
          observer.complete()
          throw new Error('EventBus error: ' + event);
        },
        onclose(){
          // if the server closes the connection unexpectedly, retry:
          serviceThis.abortEventBus()
        },
        signal: this.eventBusAbortController.signal,
      }).then(
        () => observer.complete(),
        error => observer.error(error)
      )
    });
    return this.eventBus
  }

}
