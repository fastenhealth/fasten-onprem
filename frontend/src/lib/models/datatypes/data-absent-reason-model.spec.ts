import { codeableConceptR4Factory } from "src/lib/fixtures/factories/r4/datatypes/codeable-concept-r4-factory";
import { DataAbsentReasonModel } from "./data-absent-reason-model";

describe('DataAbsentReasonModel', () => {
  it('should create an instance', () => {
    expect(new DataAbsentReasonModel({})).toBeTruthy();
  });

  it('returns the correct visualization types', () => {
    expect(new DataAbsentReasonModel({}).visualizationTypes()).toEqual(['table']);
  });

  describe('valueObject', () => {
    it('uses text if it is set', () => {
      let model = new DataAbsentReasonModel(codeableConceptR4Factory.text('Unknown').build());

      expect(model.valueObject()).toEqual({ value: 'Unknown' });
    });

    it('uses the first coding display if text is not set', () => {
      let model = new DataAbsentReasonModel(codeableConceptR4Factory.coding({ display: 'Unknown' }).build());

      expect(model.valueObject()).toEqual({ value: 'Unknown' });
    });

    it('does not error when data is malformed', () => {
      expect(new DataAbsentReasonModel({}).valueObject()).toEqual({ value: null });
    });
  });

  describe('display', () => {
    it('uses text if it is set', () => {
      let model = new DataAbsentReasonModel(codeableConceptR4Factory.text('unknown').build());

      expect(model.display()).toEqual('unknown (data absent)');
    });

    it('uses the first coding display if text is not set', () => {
      let model = new DataAbsentReasonModel(codeableConceptR4Factory.coding({ display: 'Unknown' }).build());

      expect(model.display()).toEqual('Unknown (data absent)');
    });

    it('does not error when data is malformed', () => {
      expect(new DataAbsentReasonModel({}).display()).toEqual('(data absent)');
    });
  });
});
