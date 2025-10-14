import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {Observable, of} from 'rxjs';
import {ToastService} from './services/toast.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

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

  constructor(
    private router: Router,
    private toastService: ToastService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {

    // navbar backdrop for mobile only
    const navbarBackdrop = document.createElement('div');
    navbarBackdrop.classList.add('az-navbar-backdrop');
    document.querySelector('body').appendChild(navbarBackdrop);

    //determine if we should show the header
    this.router.events.subscribe(event => this.routerEvent(event));
  }

  routerEvent(event) {
    if (event instanceof NavigationEnd) {
      //modify header
      if (event.url?.startsWith('/auth') || event.url?.startsWith('/desktop') || event.url?.startsWith('/encryption-key')) {
        this.showHeader = false;
      } else {
        this.showHeader = true;
      }

      // close all open modals when route change
      this.modalService.dismissAll();
    }
  }
}
