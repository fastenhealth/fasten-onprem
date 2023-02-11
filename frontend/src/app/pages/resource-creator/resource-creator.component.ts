import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-resource-creator',
  templateUrl: './resource-creator.component.html',
  styleUrls: ['./resource-creator.component.scss']
})
export class ResourceCreatorComponent implements OnInit {

  collapsePanel: {[name: string]: boolean} = {}




  constructor() { }

  ngOnInit(): void {
  }

}
