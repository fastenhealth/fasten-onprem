import { PatientModel } from './patient-model';

describe('PatientModel', () => {
  it('should create an instance', () => {
    expect(new PatientModel({})).toBeTruthy();
  });
});
