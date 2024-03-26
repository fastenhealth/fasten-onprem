import { ObservationValue, ValueObject } from "../resources/observation-model";

export class IntegerModel implements ObservationValue {
  soruceValue: number

  constructor(value: number) {
    this.soruceValue = value;
  }

  visualizationTypes(): string[] {
    return ['bar', 'table'];
  }

  display(): string {
    return this.soruceValue.toString();
  }

  valueObject(): ValueObject {
    return { value: this.soruceValue }
  }
}
