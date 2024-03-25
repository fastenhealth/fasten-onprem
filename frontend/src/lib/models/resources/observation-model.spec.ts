import { ObservationModel } from './observation-model';
import { fhirVersions } from '../constants';
import { observationR4Factory } from 'src/lib/fixtures/factories/r4/resources/observation-r4-factory';
import { QuantityModel } from '../datatypes/quantity-model';
import { StringModel } from '../datatypes/string-model';
import { IntegerModel } from '../datatypes/integer-model';
import { BooleanModel } from '../datatypes/boolean-model';
import { ObservationValueCodeableConceptModel } from '../datatypes/observation-value-codeable-concept-model';
import { ReferenceRangeModel } from '../datatypes/reference-range-model';
import { DataAbsentReasonModel } from '../datatypes/data-absent-reason-model';

describe('ObservationModel', () => {
  it('should create an instance', () => {
    expect(new ObservationModel({})).toBeTruthy();
  });

  it('sets reference_range', () => {
    expect(new ObservationModel({}).reference_range).toBeInstanceOf(ReferenceRangeModel);
  });

  describe('value_model', () => {
    it('is null if there is no value setting', () => {
      expect(new ObservationModel({}).value_model).toBeFalsy();
    });

    it('is a QuantityModel if valueQuantity is set', () => {
      let observation = new ObservationModel(observationR4Factory.valueQuantity().build(), fhirVersions.R4);

      expect(observation.value_model).toBeInstanceOf(QuantityModel);
    });

    it('is a ObservationValueStringModel if valueString is set', () => {
      let observation = new ObservationModel(observationR4Factory.valueString().build(), fhirVersions.R4);

      expect(observation.value_model).toBeInstanceOf(StringModel);
    });

    it('is a ObservationValueIntegerModel if valueInteger is set', () => {
      let observation = new ObservationModel(observationR4Factory.valueInteger().build(), fhirVersions.R4);

      expect(observation.value_model).toBeInstanceOf(IntegerModel);
    });

    it('is a ObservationValueBooleanModel if valueBoolean is set', () => {
      let observation = new ObservationModel(observationR4Factory.valueBoolean().build(), fhirVersions.R4);

      expect(observation.value_model).toBeInstanceOf(BooleanModel);
    });

    it('is a ObservationValueCodeableConceptModel if valueCodeableConcept is set', () => {
      let observation = new ObservationModel(observationR4Factory.valueCodeableConcept().build(), fhirVersions.R4);

      expect(observation.value_model).toBeInstanceOf(ObservationValueCodeableConceptModel);
    });

    it('is a ObservationValueDataAbsentReasonModel if dataAbsentReason is set', () => {
      let observation = new ObservationModel(observationR4Factory.dataAbsent().build(), fhirVersions.R4);

      expect(observation.value_model).toBeInstanceOf(DataAbsentReasonModel);
    });
  });
});
