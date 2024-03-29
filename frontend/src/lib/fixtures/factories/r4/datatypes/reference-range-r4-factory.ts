import { Factory } from 'fishery';

class ReferenceRangeR4Factory extends Factory<{}> {
  text(value?: string) {
    return this.params({
      text: value || '<10'
    })
  }

  high(params?: {}) {
    let p = params || {}
    return this.params({
      text: null,
      high: {
        value: p['value'] || 6.2,
        unit: p['unit'] || '',
        system: p['system'] || '',
        code: p['code'] || '',
      }
    })
  }

  low(params?: {}) {
    let p = params || {}
    return this.params({
      text: null,
      low: {
        value: p['value'] || 6.2,
        unit: p['unit'] || '',
        system: p['system'] || '',
        code: p['code'] || '',
      }
    })
  }
}

export const referenceRangeR4Factory = ReferenceRangeR4Factory.define(() => (
  {
    text: '<10'
  }
));
