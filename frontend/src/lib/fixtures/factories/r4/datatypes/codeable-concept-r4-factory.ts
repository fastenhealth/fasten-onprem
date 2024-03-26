import { Factory } from 'fishery';

class CodableConceptR4Factory extends Factory<{}> {
  text(value?: string) {
    return this.params({
      text: value || 'Glucose [Moles/volume] in Blood'
    })
  }

  coding(params?: {}) {
    let p = params || {}
    return this.params({
      text: null,
      coding: [
        {
          system: p['system'] || 'http://loinc.org',
          code: p['code'] || '15074-8',
          display: p['display'] || 'Glucose [Moles/volume] in Blood'
        }
      ]
    })
  }
}


export const codeableConceptR4Factory = CodableConceptR4Factory.define(() => (
  {
    text: 'Glucose [Moles/volume] in Blood'
  }
));
