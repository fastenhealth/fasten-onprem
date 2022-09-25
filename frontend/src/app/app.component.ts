import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'fastenhealth';

  public layoutOption: string;
  showHeader:boolean = true;
  showFooter:boolean = true;

  constructor(private router: Router) {}

  ngOnInit() {

    // navbar backdrop for mobile only
    const navbarBackdrop = document.createElement('div');
    navbarBackdrop.classList.add('az-navbar-backdrop');
    document.querySelector('body').appendChild(navbarBackdrop);


    //determine if we should show the header
    this.router.events.subscribe(event => this.modifyHeader(event));
  }

  modifyHeader(location) {
    if(location.url.startsWith('/auth'))
    {
      this.showHeader = false;
    } else {
      this.showHeader = true;
    }
  }
}


