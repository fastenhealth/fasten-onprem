import { ObservationValue, ValueObject } from "../resources/observation-model";

export class BooleanModel implements ObservationValue {
  source: boolean

  constructor(value: boolean) {
    this.source = value;
  }

  visualizationTypes(): string[] {
    return ['table'];
  }

  display(): string {
    return this.source.toString();
  }

  valueObject(): ValueObject {
    return { value: this.source };
  }

}
