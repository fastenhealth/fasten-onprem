import { quantityR4Factory } from "src/lib/fixtures/factories/r4/datatypes/quantity-r4-factory";
import { RangeModel } from "./range-model";


describe('RangeModel', () => {
  it('should create an instance', () => {
    expect(new RangeModel({})).toBeTruthy();
  });

  describe('display', () => {
    it('returns the correct display when there is only a low', () => {
      let range = new RangeModel({ low: quantityR4Factory.value(6.2).build() })
      let range2 = new RangeModel({ low: quantityR4Factory.value(6.2).unit('g').build() })

      expect(range.display()).toEqual('> 6.2')
      expect(range2.display()).toEqual('> 6.2 g')
    });

    it('returns the correct display when there is only a high', () => {
      let range = new RangeModel({ high: quantityR4Factory.value(6.2).build() })
      let range2 = new RangeModel({ high: quantityR4Factory.value(6.2).unit('g').build() })

      expect(range.display()).toEqual('< 6.2')
      expect(range2.display()).toEqual('< 6.2 g')
    });

    it('returns the correct display when there both a high and low', () => {
      let range = new RangeModel({ low: quantityR4Factory.value(6.2).build(), high: quantityR4Factory.value(8.9).build() })
      let range2 = new RangeModel({ low: quantityR4Factory.value(6.2).unit('g').build(), high: quantityR4Factory.value(8.9).unit('g').build() })

      expect(range.display()).toEqual('6.2 \u{2013} 8.9')
      expect(range2.display()).toEqual('6.2 g \u{2013} 8.9 g')
    });

    it('does not error if data is malformed', () => {
      expect((new RangeModel(null)).display()).toEqual('')
      expect((new RangeModel({})).display()).toEqual('')
    });
  })

});
