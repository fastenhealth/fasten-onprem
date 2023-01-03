import { AppointmentModel } from './appointment-model';

describe('AppointmentModel', () => {
  it('should create an instance', () => {
    expect(new AppointmentModel({})).toBeTruthy();
  });
});
