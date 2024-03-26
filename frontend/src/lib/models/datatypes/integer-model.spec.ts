import { IntegerModel } from "./integer-model";

  describe('ObservationValueIntegerModel', () => {
    it('should create an instance', () => {
      expect(new IntegerModel(5)).toBeTruthy();
    });

    it('returns the correct visualization types', () => {
      expect(new IntegerModel(5).visualizationTypes()).toEqual(['bar', 'table']);
    });

    it('sets valueObject correctl', () => {
      let model = new IntegerModel(6.3);

      expect(model.valueObject()).toEqual({ value: 6.3 });
    });

    it('returns the correct display', () => {
      expect(new IntegerModel(5).display()).toEqual('5');
    });
  });
