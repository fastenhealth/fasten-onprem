import { BooleanModel } from "./boolean-model";

describe('ObservationValueBooleanModel', () => {
  it('should create an instance', () => {
    expect(new BooleanModel(false)).toBeTruthy();
  });

  it('returns the correct visualization types', () => {
    expect(new BooleanModel(false).visualizationTypes()).toEqual(['table']);
  });

  it('sets valueObject correctl', () => {
    let model = new BooleanModel(true);
    let model2 = new BooleanModel(false);

    expect(model.valueObject()).toEqual({ value: true });
    expect(model2.valueObject()).toEqual({ value: false });
  });

  it ('returns correct display', () => {
    let model = new BooleanModel(true);
    let model2 = new BooleanModel(false);

    expect(model.display()).toEqual('true');
    expect(model2.display()).toEqual('false');
  });
});
