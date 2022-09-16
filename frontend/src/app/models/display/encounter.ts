import {getPath} from '../../fhir/utils';

export class Encounter {
  encounterType: string
  encounterClass: string
  reason: string
  status: string

  constructor(resourcePayload: any) {
    this.encounterType = getPath(resourcePayload, "type.0.text");
    this.encounterClass = this.getEncounterClass(resourcePayload);
    this.reason = getPath(resourcePayload, "reason.0.coding.0.display")
    this.status = getPath(resourcePayload, "status")
  }

  getEncounterClass(encounter) {
    return encounter.class && typeof encounter.class == "object" ?
      getPath(encounter, "class.type.0.text") :
      encounter.class;
  }
}
