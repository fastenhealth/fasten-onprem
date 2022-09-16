import {Component, Input, OnInit} from '@angular/core';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {Condition} from '../../models/display/condition';

@Component({
  selector: 'app-list-condition',
  templateUrl: './list-condition.component.html',
  styleUrls: ['./list-condition.component.scss']
})
export class ListConditionComponent implements OnInit {

  @Input() resourceList: ResourceFhir[] = []
  conditionList: Condition[] = []

  constructor() { }

  ngOnInit(): void {
    let _conditions = this.conditionList
    this.resourceList.forEach((resource) => {
      let cond = new Condition(resource.payload)
      _conditions.push(cond)
    })
  }

}
