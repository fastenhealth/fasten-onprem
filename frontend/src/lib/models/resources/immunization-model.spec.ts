import { ImmunizationModel } from './immunization-model';

describe('ImmunizationModel', () => {
  it('should create an instance', () => {
    expect(new ImmunizationModel({})).toBeTruthy();
  });
  describe('with r4', () => {

    it('should parse example1.json', () => {
      let fixture = require("../../fixtures/r4/resources/immunization/example1.json")
      let expected = new ImmunizationModel({})

      expected.title = 'Fluvax (Influenza)'
      expected.status = 'completed'
      expected.providedDate  = '2013-01-10'
      // manufacturerText: string | undefined
      expected.hasLotNumber = true
      expected.lotNumber = 'AAJN11K'
      expected.lotNumberExpirationDate = '2015-02-15'
      expected.hasDoseQuantity = true
      expected.doseQuantity = { value: 5, system: 'http://unitsofmeasure.org', code: 'mg' }
      // requester: string | undefined
      // reported: string | undefined
      // performer: string | undefined
      expected.route = [ { system: 'http://terminology.hl7.org/CodeSystem/v3-RouteOfAdministration', code: 'IM', display: 'Injection, intramuscular' }]
      expected.hasRoute = true
      expected.site =  [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ActSite', code: 'LA', display: 'left arm' } ]
      expected.hasSite = true
      expected.patient = { reference: 'Patient/example' }
      expected.note = [ { text: 'Notes on adminstration of vaccine' } ]

      expect(new ImmunizationModel(fixture)).toEqual(expected);
    });
  })
});
