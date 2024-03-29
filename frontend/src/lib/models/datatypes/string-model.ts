import { ObservationValue, ValueObject } from "../resources/observation-model";

export class StringModel implements ObservationValue {
  sourceString: string

  constructor(str: string) {
    this.sourceString = str || '';
  }

  visualizationTypes(): string[] {
    if (!!this.valueObject().range || Number.isFinite(this.valueObject().value)) {
      return ['bar', 'table'];
    }

    return ['table'];
  }

  display(): string {
    return this.sourceString;
  }

  valueObject(): ValueObject {
    let matches = this.sourceString?.match(/(?<value1>[\d.]*)?(?<operator>[^\d]*)?(?<value2>[\d.]*)?/)

    switch (matches.groups['operator']?.trim()) {
      case '<':
      case '<=':
        return {
          range: {
            low: null,
            high: parseFloat(matches.groups['value2'])
          }
        }
      case '>':
      case '>=':
        return {
          range: {
            low: parseFloat(matches.groups['value2']),
            high: null
          }
        }
      case '-':
        return {
          range: {
            low: parseFloat(matches.groups['value1']),
            high: parseFloat(matches.groups['value2'])
          }
        }
    }

    let float = parseFloat(matches.groups['value1']);

    if (Number.isNaN(float)) {
      return { value: this.sourceString }
    }

    return { value: float };
  }

}
