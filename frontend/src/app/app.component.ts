import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'fastenhealth';

  public layoutOption: string;
  showHeader:boolean = false;
  showFooter:boolean = true;

  constructor(private router: Router) {}

  ngOnInit() {

    // navbar backdrop for mobile only
    const navbarBackdrop = document.createElement('div');
    navbarBackdrop.classList.add('az-navbar-backdrop');
    document.querySelector('body').appendChild(navbarBackdrop);

    //TODO: onfirst load the header is always shown, why?
    // seems to be related to the presence of jwt token, and/or auth-interceptor.
    //determine if we should show the header
    this.router.events.subscribe(event => this.modifyHeader(event));
  }

  modifyHeader(event) {
    if(event instanceof NavigationEnd && event.url?.startsWith('/auth'))
    {
      this.showHeader = false;
    } else {
      this.showHeader = true;
    }
  }
}


