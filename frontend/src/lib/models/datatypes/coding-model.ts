import _ from "lodash";

export class CodingModel {
  display?: string
  code?: string
  system?: string
  value?: any
  unit?: string
  type?: any

  constructor(fhirData: any) {
    this.display = _.get(fhirData, 'display');
    this.code = _.get(fhirData, 'code');
    this.system = _.get(fhirData, 'system');
    this.value = _.get(fhirData, 'value');
    this.unit = _.get(fhirData, 'unit');
    this.type = _.get(fhirData, 'type');
  }
}
