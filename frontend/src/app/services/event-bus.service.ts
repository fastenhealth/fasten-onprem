import {AfterViewInit, Injectable, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {AuthService} from './auth.service';
import {FastenApiService} from './fasten-api.service';
import {ToastService} from './toast.service';
import {Event} from '../models/events/event';
import {EventSourceComplete} from '../models/events/event_source_complete';
import {EventSourceSync} from '../models/events/event_source_sync';

@Injectable({
  providedIn: 'root'
})
export class EventBusService {
  eventBusSubscription: Subscription | undefined;
  eventBusSourceSyncMessages: Subject<EventSourceSync> = new Subject<EventSourceSync>();
  eventBusSourceCompleteMessages: Subject<EventSourceComplete> = new Subject<EventSourceComplete>();

  constructor(
    public router: Router,
    public authService: AuthService,
    public fastenApiService: FastenApiService,
    public toastService: ToastService
  ) {

    // Ideally we want consistently listen to events, but only when the user is authenticated.
    //TODO: find a way to abort the event bus connection.
    this.authService.IsAuthenticatedSubject.subscribe((isAuthenticated) => {
      console.log("isAuthenticated changed:", isAuthenticated)
      if(isAuthenticated){
        this.eventBusSubscription = this.fastenApiService.listenEventBus().subscribe((event: Event | EventSourceSync | EventSourceComplete)=>{
          console.log("eventbus event:", event)
          //TODO: start toasts.
          if(event.event_type == "source_sync"){
            this.eventBusSourceSyncMessages.next(event as EventSourceSync)
          } else if(event.event_type == "source_complete"){
            this.eventBusSourceCompleteMessages.next(event as EventSourceComplete)
          }
        })
      } else {
        //no longer authenticated, unsubscribe from eventbus
        if(this.eventBusSubscription){
          this.eventBusSubscription.unsubscribe()
        }
      }
    });
  }
}
