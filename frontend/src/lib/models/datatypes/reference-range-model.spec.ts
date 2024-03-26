import { referenceRangeR4Factory } from "src/lib/fixtures/factories/r4/datatypes/reference-range-r4-factory";
import { ReferenceRangeModel } from "./reference-range-model";

describe('ReferenceRangeModel', () => {
  it('should create an instance', () => {
    expect(new ReferenceRangeModel({})).toBeTruthy();
  });

  it('returns the correct display', () => {
    let range = new ReferenceRangeModel(referenceRangeR4Factory.low({value: 6.2}).high({value: 8.3}).build());
    let range2 = new ReferenceRangeModel(referenceRangeR4Factory.text('50.3mg/L-109.2mg/L').build());

    expect(range.display()).toEqual('6.2 \u{2013} 8.3')
    expect(range2.display()).toEqual('50.3mg/L-109.2mg/L')
  });

  describe('parsing data', () => {
    it('parses high and low correctly', () => {
      let range = new ReferenceRangeModel(referenceRangeR4Factory.low({value: 6.2}).high({value: 8.3}).build());

      expect(range.low_value).toEqual(6.2);
      expect(range.high_value).toEqual(8.3);
    });

    describe('when text is set', () => {
      it('parses values correctly when there is a high and a low', () => {
        let tests = [
          { text: '50.3-109.2', result: { low: 50.3, high: 109.2 } },
          { text: '50.3mg/L-109.2mg/L', result: { low: 50.3, high: 109.2 } },
          { text: '50.3-109.2mg/L', result: { low: 50.3, high: 109.2 } },
          { text: '50.3mg/L-109.2', result: { low: 50.3, high: 109.2 } }
        ]

        for(let test of tests) {
          let range = new ReferenceRangeModel(referenceRangeR4Factory.text(test.text).build());
          expect(range.low_value).toEqual(test.result.low);
          expect(range.high_value).toEqual(test.result.high);
        }
      });

      it('parses values correctly when there is only a low', () => {
        let tests = [
          { text: '>50.3', result: { low: 50.3, high: null } },
          { text: '>50.3mg/L', result: { low: 50.3, high: null } },
          { text: '>=50.3', result: { low: 50.3, high: null } },
          { text: '>=50.3mg/L', result: { low: 50.3, high: null } }
        ]

        for(let test of tests) {
          let range = new ReferenceRangeModel(referenceRangeR4Factory.text(test.text).build());
          expect(range.low_value).toEqual(test.result.low);
          expect(range.high_value).toEqual(test.result.high);
        }
      });

      it('parses values correctly when there is only a high', () => {
        let tests = [
          { text: '<109.2', result: { low: null, high: 109.2 } },
          { text: '<109.2mg/L', result: { low: null, high: 109.2 } },
          { text: '<=109.2', result: { low: null, high: 109.2 } },
          { text: '<=109.2mg/L', result: { low: null, high: 109.2 } }
        ]

        for(let test of tests) {
          let range = new ReferenceRangeModel(referenceRangeR4Factory.text(test.text).build());
          expect(range.low_value).toEqual(test.result.low);
          expect(range.high_value).toEqual(test.result.high);
        }
      });
    });
  });
});
