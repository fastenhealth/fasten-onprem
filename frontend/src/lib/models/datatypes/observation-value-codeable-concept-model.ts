import { CodeableConcept, Coding } from "fhir/r4";
import { ObservationValue, ValueObject } from "../resources/observation-model";

// TODO: merge with the normal CodeableConceptModel.
export class ObservationValueCodeableConceptModel implements ObservationValue {
  source: CodeableConcept
  coding?: Coding[]
  text?: string

  constructor(fhirData: any) {
    this.source = fhirData;
    this.coding = fhirData.coding
    this.text = fhirData.text
  }

  visualizationTypes(): string[] {
    return ['table'];
  }

  display(): string {
    return this.valueObject().value?.toString() || '';
  }

  valueObject(): ValueObject {
    if (this.text) {
      return { value: this.text }
    }

    if (!this.coding) {
      return { value: null }
    }

    return { value: this.coding[0].display }
  }
}
