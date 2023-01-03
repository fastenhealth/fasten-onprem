import * as _ from "lodash";

export class HumanNameModel {
  givenName: string
  familyName: string
  suffix: string
  textName: string
  use: string
  header: string


  constructor(fhirData: any) {
    this.givenName = _.get(fhirData, 'given', []).join(', ');
    this.familyName = _.flatten(Array(_.get(fhirData, 'family', ''))).join(', ');
    this.suffix = _.get(fhirData, 'suffix', []).join(' ');
    this.textName = _.get(fhirData, 'text');
    this.use = _.get(fhirData, 'use');
    this.header = this.textName ? this.textName : `${this.givenName} ${this.familyName} ${this.suffix}`.trim();
  }
}
