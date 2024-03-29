import { Factory } from 'fishery';

class QuantityR4Factory extends Factory<{}> {
  value(value?: number) {
    return this.params({
      value: value || 5.5
    })
  }

  comparator(comparator: string) {
    return this.params({
      comparator: comparator
    })
  }

  unit(unit?: string) {
    return this.params({
      unit: unit || 'mmol/l'
    })
  }

  system(system?: string) {
    return this.params({
      system: system || 'http://unitsofmeasure.org'
    })
  }

  code(code?: string) {
    return this.params({
      code: code || 'mmol/l'
    })
  }
}


export const quantityR4Factory = QuantityR4Factory.define(() => (
  {}
));
