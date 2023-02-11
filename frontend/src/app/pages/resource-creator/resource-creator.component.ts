import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-resource-creator',
  templateUrl: './resource-creator.component.html',
  styleUrls: ['./resource-creator.component.scss']
})
export class ResourceCreatorComponent implements OnInit {

  collapsePanel: {[name: string]: boolean} = {}

  model: any = {
    condition: {
      data: {},
      status: null,
      started: null,
      stopped: null,
      description: null,
    }
  }


  constructor() { }

  ngOnInit(): void {
  }

}
