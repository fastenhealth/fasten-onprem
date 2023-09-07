import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-desktop-callback',
  templateUrl: './desktop-callback.component.html',
  styleUrls: ['./desktop-callback.component.scss']
})
export class DesktopCallbackComponent implements OnInit {

  //This component is used to redirect the user to the desktop app after they have authenticated with a source
  constructor() { }

  ngOnInit(): void {
    wails.Event.Emit({
      name: "wails:fasten-lighthouse:success",
      data:

    )
  }

}
