import {Component, Input, OnInit} from '@angular/core';
import {getCodeOrConcept} from '../../fhir/utils';
import {CODE_SYSTEMS} from '../../fhir/constants';
import {ResourceFhir} from '../../models/fasten/resource_fhir';


export class Condition {
  name: string
  nameCode: string
  nameCodeSystem: string
  clinicalStatus: string
  verificationStatus: string
  onset: string

  constructor(resourcePayload: any) {
    this.populateConditionName(resourcePayload)
    this.clinicalStatus = getCodeOrConcept(resourcePayload.clinicalStatus)
    this.verificationStatus = getCodeOrConcept(resourcePayload.verificationStatus)

  }

  populateConditionName(resourePayload: any){
    if (resourePayload.code) {
      if (resourePayload.code.text) {
        this.name = resourePayload.code.text;
      }
      if (Array.isArray(resourePayload.code.coding) && resourePayload.code.coding.length) {
        let c = resourePayload.code.coding[0]

        this.nameCodeSystem = c.system
        for (let key in CODE_SYSTEMS) {
          if (CODE_SYSTEMS[key].url === c.system) {
            this.nameCodeSystem = `(${key})`;
            break;
          }
        }

        if (c.display) {
          this.name = c.display
        }
        if (c.code) {
          this.nameCode = c.code
        }
      }
    }
  }

}

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
    console.log("INSIDE LIST CONDIDITION", this.resourceList)
    let _conditions = this.conditionList
    this.resourceList.forEach((resource) => {
      let cond = new Condition(resource.payload)
      _conditions.push(cond)
      console.log("PARSED CONDITITION", cond)
    })

    console.log("COMPLETED", this.conditionList)
  }

}
