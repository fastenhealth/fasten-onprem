import {Component, Input, OnInit} from '@angular/core';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {CarePlan} from '../../models/display/care-plan';

@Component({
  selector: 'app-list-care-plan',
  templateUrl: './list-care-plan.component.html',
  styleUrls: ['./list-care-plan.component.scss']
})
export class ListCarePlanComponent implements OnInit {

  @Input() resourceList: ResourceFhir[] = []
  careplanList: CarePlan[] = []

  constructor() { }

  ngOnInit(): void {
    let _careplanList = this.careplanList
    this.resourceList.forEach((resource) => {
      let careplan = new CarePlan(resource.payload)
      _careplanList.push(careplan)
    })
  }

}
