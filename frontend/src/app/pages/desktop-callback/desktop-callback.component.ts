import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-desktop-callback',
  templateUrl: './desktop-callback.component.html',
  styleUrls: ['./desktop-callback.component.scss']
})
export class DesktopCallbackComponent implements OnInit {

  //This component is used to redirect the user to the desktop app after they have authenticated with a source
  constructor(private activatedRoute : ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(values => {
      wails.Events.Emit({
        name: "wails:fasten-lighthouse:response",
        data: values,
      })
    })
  }
}
