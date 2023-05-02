import { Component, OnInit } from '@angular/core';
import {versionInfo} from '../../../environments/versions';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  appVersion: string;

  constructor() {
    this.appVersion = versionInfo.version
  }

  ngOnInit() {
  }

}
