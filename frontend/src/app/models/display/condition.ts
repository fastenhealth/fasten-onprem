import {getCodeOrConcept} from '../../fhir/utils';
import {CODE_SYSTEMS} from '../../fhir/constants';

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
    this.onset = resourcePayload.onsetDateTime
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
