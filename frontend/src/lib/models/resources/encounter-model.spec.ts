import { EncounterModel } from './encounter-model';
import {DocumentReferenceModel} from './document-reference-model';

describe('EncounterModel', () => {
  it('should create an instance', () => {
    expect(new EncounterModel({})).toBeTruthy();
  });
  describe('with r4', () => {

    it('should parse example1.json', () => {
      let fixture = require("../../fixtures/r4/resources/encounter/example1.json")
      let expected = new EncounterModel({})
      // periodEnd: string | undefined
      // periodStart: string | undefined
      // hasParticipant: boolean | undefined
      // locationDisplay: string | undefined
      // encounterType: string | undefined
      expected.resource_class = 'inpatient encounter'
      expected.resource_status = 'in-progress'
      // participant

      expect(new EncounterModel(fixture)).toEqual(expected);
    });

    it('should parse example2.json', () => {
      let fixture = require("../../fixtures/r4/resources/encounter/example2.json")
      let expected = new EncounterModel({})
      expected.period_end = '2015-01-17T16:30:00+10:00'
      expected.period_start = '2015-01-17T16:00:00+10:00'
      expected.has_participant = true
      expected.location_display = 'Client\'s home'
      // encounterType: string | undefined
      expected.resource_class =  'home health'
      expected.resource_status = 'finished'
      expected.participant = [
        {
          display: undefined,
          reference: { reference: 'Practitioner/example', display: 'Dr Adam Careful' },
          text: undefined,
          periodStart: '2015-01-17T16:00:00+10:00'
        }
      ]

      expect(new EncounterModel(fixture)).toEqual(expected);
    });

    it('should parse example3.json', () => {
      let fixture = require("../../fixtures/r4/resources/encounter/example3.json")
      let expected = new EncounterModel({})
      // expected.periodEnd = '2015-01-17T16:30:00+10:00'
      // expected.periodStart = '2015-01-17T16:00:00+10:00'
      expected.has_participant = true
      expected.location_display = 'Encounter'
      expected.encounter_type = [ { coding: [ Object({ system: 'http://snomed.info/sct', code: '11429006', display: 'Consultation' }) ] } ]
      expected.resource_class = 'ambulatory'
      expected.resource_status = 'finished'
      expected.participant = [
        { display: undefined, reference: Object({ reference: 'Practitioner/f201' }), text: undefined, periodStart: undefined }
      ]

      expect(new EncounterModel(fixture)).toEqual(expected);
    });

  })

});
