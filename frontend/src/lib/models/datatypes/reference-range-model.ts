import _ from "lodash";
import { ObservationValueCodeableConceptModel } from "./observation-value-codeable-concept-model";
import { QuantityModel } from "./quantity-model";
import { RangeModel } from "./range-model";
import { CodeableConcept, ObservationReferenceRange, Quantity, Range, RatioRange } from "fhir/r4";

// https://www.hl7.org/fhir/R4/observation-definitions.html#Observation.referenceRange
// Must have high or low or text
export class ReferenceRangeModel implements ObservationReferenceRange {
  low?: Quantity // Simple Quantity (no comparator)
  low_value?: number
  high?: Quantity // Simple Quantity (no comparator)
  high_value?: number
  type?: CodeableConcept
  appliesTo?: CodeableConcept[]
  age?: RangeModel
  text?: string

  constructor(fhirData: any) {
    this.low = new QuantityModel(_.get(fhirData, 'low'));
    this.high = new QuantityModel(_.get(fhirData, 'high'));
    this.type = _.get(fhirData, 'type');
    this.appliesTo = _.get(fhirData, 'appliesTo');
    this.age = _.get(fhirData, 'age');
    this.text = _.get(fhirData, 'text');

    let standardizedValues = this.chartableReferenceRange()
    this.low_value = standardizedValues.low;
    this.high_value = standardizedValues.high;
  }

  hasValue(): boolean {
    return !!this.text || !!this.low_value || !!this.high_value;
  }

  display(): string {
    return this.text || new RangeModel({low: this.low, high: this.high}).display()
  }

  chartableReferenceRange(): { low?: number, high?: number} {
    if (this.low.value || this.high.value) {
      return { low: this.low.value, high: this.high.value }
    }

    let matches = this.text?.match(/(?<value1>[\d.]*)?(?<operator>[^\d]*)?(?<value2>[\d.]*)?/)

    if(!matches) {
      return { low: null, high: null }
    }

    if (!!matches.groups['value1'] && !!matches.groups['value2']) {
      return {
        low: parseFloat(matches.groups['value1']),
        high: parseFloat(matches.groups['value2'])
      }
    }

    if (['<', '<='].includes(matches.groups['operator'])) {
      return {
        low: null,
        high: parseFloat(matches.groups['value2'])
      }
    } else { // > >=
      return {
        low: parseFloat(matches.groups['value2']),
        high: null
      }
    }
  }
}
