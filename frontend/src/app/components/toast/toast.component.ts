import {Component, OnInit, TemplateRef} from '@angular/core';
import {ToastService} from '../../services/toast.service';
import {AuthService} from '../../services/auth.service';
import {FastenApiService} from '../../services/fasten-api.service';
import {Subscription} from 'rxjs';
import {NavigationEnd, Router} from '@angular/router';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit {
  routerSubscription: Subscription | undefined;

  constructor(
    public router: Router,
    public toastService: ToastService,
    public authService: AuthService,
    public fastenApiService: FastenApiService,
  ) {}

  ngOnInit(): void {

  }
  ngAfterViewInit() {
    //TODO: this is a bit kludgey.
    // Ideally we want consistently listen to events, but only when the user is authenticated.
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if(!event.url.startsWith("/auth") && this.authService.IsAuthenticated()){
          console.log("user is authenticated, listening for notifications")
          //user is authenticated, lets start listening for notifications
          this.routerSubscription?.unsubscribe()
          this.fastenApiService.listenEventBus().subscribe((event)=>{
            console.log("eventbus event:", event)
            //TODO: start toasts.
          })
        }
      }
    });
  }
}
