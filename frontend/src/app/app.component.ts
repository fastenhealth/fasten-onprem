import { Component, OnInit } from '@angular/core';

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

  ngOnInit() {

    // navbar backdrop for mobile only
    const navbarBackdrop = document.createElement('div');
    navbarBackdrop.classList.add('az-navbar-backdrop');
    document.querySelector('body').appendChild(navbarBackdrop);
  }
}


