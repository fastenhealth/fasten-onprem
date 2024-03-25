
import { StringModel } from "./string-model";

  describe('ObservationValueStringModel', () => {
    it('should create an instance', () => {
      expect(new StringModel(null)).toBeTruthy();
    });

    it('returns the correct visualization types', () => {
      expect(new StringModel('Negative').visualizationTypes()).toEqual(['table']);
      expect(new StringModel('< 10 IntlUnit/mL').visualizationTypes()).toEqual(['bar', 'table']);
    });

    describe('valueObject', () => {
      describe('when the string contains a numerical string', () => {
        it('sets value correctly', () => {
          let stringValue = new StringModel('6.3 IntlUnit/mL');
          let stringValue2 = new StringModel('6.3 mml/min/1.03');

          expect(stringValue.valueObject()).toEqual({ value: 6.3 });
          expect(stringValue2.valueObject()).toEqual({ value: 6.3 });
        });

        it('sets range correctly if there is a range', () => {
          let stringValue = new StringModel('5 - 10 IntlUnit/mL');
          let stringValue2 = new StringModel('5-10 IntlUnit/mL');

          expect(stringValue.valueObject()).toEqual({ range: { low: 5, high: 10 } });
          expect(stringValue2.valueObject()).toEqual({ range: { low: 5, high: 10 } });
        });

        it('sets range correctly if there is a comparator', () => {
          let stringValue = new StringModel('< 10 IntlUnit/mL');
          let stringValue2 = new StringModel('>10 IntlUnit/mL');

          expect(stringValue.valueObject()).toEqual({ range: { low: null, high: 10 } });
          expect(stringValue2.valueObject()).toEqual({ range: { low: 10, high: null } });
        });
      });

      describe('when the string does not contain a numerical string', () => {
        it('sets the value to the passed string', () => {
          let stringValue = new StringModel('Negative');

          expect(stringValue.valueObject()).toEqual({ value: 'Negative' });
        });
      });
    });

    it('returns the correct display', () => {
      expect(new StringModel('Negative').display()).toEqual('Negative');
      expect(new StringModel('< 10 IntlUnit/mL').display()).toEqual('< 10 IntlUnit/mL');
    });
  });
