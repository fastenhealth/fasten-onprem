import { Quantity } from 'fhir/r4';
import { ObservationValue, ValueObject } from '../resources/observation-model';
import _ from 'lodash';

// https://www.hl7.org/fhir/R4/datatypes.html#Quantity
// Also used for SimpleQuantity which is Quantity but with the rule that 'comparator' should not be set
export class QuantityModel implements Quantity, ObservationValue {
  value?: number
  comparator?: '<' | '<=' | '>=' | '>'
  unit?: string
  system?: string
  code?: string

  constructor(fhirData: any) {
    this.value = _.get(fhirData, 'value');
    this.comparator = _.get(fhirData, 'comparator');
    this.unit = _.get(fhirData, 'unit');
    this.system = _.get(fhirData, 'system');
    this.code = _.get(fhirData, 'code');
  }

  visualizationTypes(): string[] {
    return ['bar', 'table'];
  }

  hasValue(): boolean {
    return !!this.value;
  }

  display(): string {
    return [this.comparator, this.value, this.unit].join(' ').trim()
  }

  valueObject(): ValueObject {
    switch (this.comparator) {
      case '<':
      case '<=':
        return { range: { low: null, high: this.value } };
      case '>':
      case '>=':
        return { range: { low: this.value, high: null } };
      default:
        return { value: this.value }
    }
  }
}
