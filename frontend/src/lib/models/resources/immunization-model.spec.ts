import { ImmunizationModel } from './immunization-model';
import * as example1Fixture from "../../fixtures/r4/resources/immunization/example1.json"

describe('ImmunizationModel', () => {
  it('should create an instance', () => {
    expect(new ImmunizationModel({})).toBeTruthy();
  });
  describe('with r4', () => {

    it('should parse example1.json', () => {
      let expected = new ImmunizationModel({})

      expected.title = 'Fluvax (Influenza)'
      expected.status = 'completed'
      expected.provided_date  = '2013-01-10'
      // manufacturerText: string | undefined
      expected.has_lot_number = true
      expected.lot_number = 'AAJN11K'
      expected.lot_number_expiration_date = '2015-02-15'
      expected.has_dose_quantity = true
      expected.dose_quantity = { value: 5, system: 'http://unitsofmeasure.org', code: 'mg' }
      // requester: string | undefined
      // reported: string | undefined
      // performer: string | undefined
      expected.route = [ { system: 'http://terminology.hl7.org/CodeSystem/v3-RouteOfAdministration', code: 'IM', display: 'Injection, intramuscular' }]
      expected.has_route = true
      expected.site =  [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ActSite', code: 'LA', display: 'left arm' } ]
      expected.has_site = true
      expected.patient = { reference: 'Patient/example' }
      expected.note = [ { text: 'Notes on adminstration of vaccine' } ]

      expect(new ImmunizationModel(example1Fixture)).toEqual(expected);
    });
  })
});
