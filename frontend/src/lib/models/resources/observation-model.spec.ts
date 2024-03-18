import { ObservationModel } from './observation-model';
import { fhirVersions } from '../constants';
import { observationR4Factory } from 'src/lib/fixtures/factories/r4/resources/observation-r4-factory';

describe('ObservationModel', () => {
  it('should create an instance', () => {
    expect(new ObservationModel({})).toBeTruthy();
  });

  describe('parsing value', () => {
    it('reads from valueQuantity.value if set', () => {
      let observation = new ObservationModel(observationR4Factory.build(), fhirVersions.R4);

      expect(observation.value_object.value).toEqual(6.3);
    });

    it('parses valueString correctly when value is a number if valueQuantity.value not set', () => {
      let observation = new ObservationModel(observationR4Factory.valueString().build(), fhirVersions.R4);

      expect(observation.value_object.value).toEqual(5.5);
    });

    it('parses value correctly when valueQuantity.comparator is set', () => {
      let observation = new ObservationModel(observationR4Factory.valueQuantity({ comparator: '<', value: 8 }).build(), fhirVersions.R4);
      let observation2 = new ObservationModel(observationR4Factory.valueQuantity({ comparator: '>', value: 8 }).build(), fhirVersions.R4);

      expect(observation.value_object).toEqual({ range: { low: null, high: 8 } });
      expect(observation2.value_object).toEqual({ range: { low: 8, high: null } });
    });

    it('parses value correctly when valueString has a range', () => {
      let observation = new ObservationModel(observationR4Factory.valueString('<10 IntlUnit/mL').build(), fhirVersions.R4);
      let observation2 = new ObservationModel(observationR4Factory.valueString('>10 IntlUnit/mL').build(), fhirVersions.R4);

      expect(observation.value_object).toEqual({ range: { low: null, high: 10 } });
      expect(observation2.value_object).toEqual({ range: { low: 10, high: null } });
    });

    // following two tests being kept temporarily. will be removed in next PR when I remove value_quantity_value
    it('reads from valueQuantity.value if set', () => {
      let observation = new ObservationModel(observationR4Factory.build(), fhirVersions.R4);

      expect(observation.value_quantity_value).toEqual(6.3);
    });

    it('parses valueString correctly when value is a number if valueQuantity.value not set', () => {
      let observation = new ObservationModel(observationR4Factory.valueString().build(), fhirVersions.R4);

      expect(observation.value_quantity_value).toEqual(5.5);
    });
  });


  describe('parsing unit', () => {
    it('reads from valueQuantity.unit if set', () => {
      let observation = new ObservationModel(observationR4Factory.build(), fhirVersions.R4);

      expect(observation.value_quantity_unit).toEqual('mmol/l');
    });

    it('reads from valueString if valueQuantity.unit not set', () => {
      let observation = new ObservationModel(observationR4Factory.valueString().build(), fhirVersions.R4);

      expect(observation.value_quantity_unit).toEqual('mmol/l');
    });
  });

  describe('parsing reference range', () => {
    it('parses referenceRange correctly when high and low are not set', () => {
      let observation = new ObservationModel(observationR4Factory.build(), fhirVersions.R4);

      expect(observation.reference_range).toEqual({ low: null, high: null });
    });

    it('parses referenceRange correctly when high and low are set', () => {
      let observation = new ObservationModel(observationR4Factory.referenceRange().build(), fhirVersions.R4);

      expect(observation.reference_range).toEqual({ low: 3.1, high: 6.5 });
    });

    describe('when referenceRange.text is set', () => {
      it('parses values correctly when there is a high and a low', () => {
        let tests = [
          { text: '50.3-109.2', result: { low: 50.3, high: 109.2 } },
          { text: '50.3mg/L-109.2mg/L', result: { low: 50.3, high: 109.2 } },
          { text: '50.3-109.2mg/L', result: { low: 50.3, high: 109.2 } },
          { text: '50.3mg/L-109.2', result: { low: 50.3, high: 109.2 } }
        ]

        for(let test of tests) {
          let observation = new ObservationModel(observationR4Factory.referenceRangeString(test.text).build(), fhirVersions.R4);
          expect(observation.reference_range).toEqual(test.result)
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
          let observation = new ObservationModel(observationR4Factory.referenceRangeStringOnlyLow(test.text).build(), fhirVersions.R4);
          expect(observation.reference_range).toEqual(test.result)
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
          let observation = new ObservationModel(observationR4Factory.referenceRangeStringOnlyHigh(test.text).build(), fhirVersions.R4);
          expect(observation.reference_range).toEqual(test.result)
        }
      });
    });
  });
});
