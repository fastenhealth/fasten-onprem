import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {Observable, of} from 'rxjs';
import {ToastService} from './services/toast.service';

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

  constructor(private router: Router, private toastService: ToastService) {}

  ngOnInit() {

    // navbar backdrop for mobile only
    const navbarBackdrop = document.createElement('div');
    navbarBackdrop.classList.add('az-navbar-backdrop');
    document.querySelector('body').appendChild(navbarBackdrop);

    //determine if we should show the header
    this.router.events.subscribe(event => this.modifyHeader(event));
  }

  modifyHeader(event) {
    if (event instanceof NavigationEnd) {
      if (event.url?.startsWith('/auth')) {
        this.showHeader = false;
      } else {
        // console.log("NU")
        this.showHeader = true;
      }
    }
  }
}


