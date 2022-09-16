import {Component, Input, OnInit} from '@angular/core';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {Encounter} from '../../models/display/encounter';
import {Immunization} from '../../models/display/immunization';

@Component({
  selector: 'app-list-immunization',
  templateUrl: './list-immunization.component.html',
  styleUrls: ['./list-immunization.component.scss']
})
export class ListImmunizationComponent implements OnInit {

  @Input() resourceList: ResourceFhir[] = []
  immunizationList: Immunization[] = []

  constructor() { }

  ngOnInit(): void {
    let _immunizationList = this.immunizationList
    this.resourceList.forEach((resource) => {
      let immunization = new Immunization(resource.payload)
      _immunizationList.push(immunization)
    })
  }

}
