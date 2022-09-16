import {Component, Input, OnInit} from '@angular/core';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {Condition} from '../../models/display/condition';
import {Encounter} from '../../models/display/encounter';

@Component({
  selector: 'app-list-encounter',
  templateUrl: './list-encounter.component.html',
  styleUrls: ['./list-encounter.component.scss']
})
export class ListEncounterComponent implements OnInit {

  @Input() resourceList: ResourceFhir[] = []
  encounterList: Encounter[] = []

  constructor() { }

  ngOnInit(): void {
    let _encounterList = this.encounterList
    this.resourceList.forEach((resource) => {
      let encounter = new Encounter(resource.payload)
      _encounterList.push(encounter)
    })
  }
}
