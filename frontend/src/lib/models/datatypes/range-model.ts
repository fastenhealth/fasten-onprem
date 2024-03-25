import { Range } from "fhir/r4";
import { QuantityModel } from "./quantity-model";
import _ from "lodash";

export class RangeModel implements Range {
  low?: QuantityModel
  high?: QuantityModel

  constructor(fhirData: any) {
    this.low = new QuantityModel(_.get(fhirData, 'low'));
    this.high = new QuantityModel(_.get(fhirData, 'high'));
  }

  display(): string {
    if (this.low.hasValue() && this.high.hasValue()) {
      return [this.low.display(), '\u{2013}', this.high.display()].join(' ').trim();
    } else if (this.low.hasValue()) {
      return ['>', this.low.display()].join(' ').trim();
    } else if (this.high.hasValue()) {
      return ['<', this.high.display()].join(' ').trim();
    }

    return '';
  }
}
