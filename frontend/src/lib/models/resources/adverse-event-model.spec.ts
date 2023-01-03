import { AdverseEventModel } from './adverse-event-model';
import {AllergyIntoleranceModel} from './allergy-intolerance-model';
import {CodableConceptModel} from '../datatypes/codable-concept-model';

describe('AdverseEventModel', () => {
  it('should create an instance', () => {
    expect(new AdverseEventModel({})).toBeTruthy();
  });

  describe('with r4', () => {

    it('should parse example1.json', () => {
      let fixture = require("../../fixtures/r4/resources/adverseEvent/example1.json")
      let expected = new AdverseEventModel({})
      expected.subject = {
        "reference": "Patient/example"
      }
      // expected.description = ''
      // expected.eventType = ''
      // expected.hasEventType = true
      expected.date = "2017-01-29T12:34:56+00:00"
      expected.seriousness = new CodableConceptModel({ coding: [ Object({ system: 'http://terminology.hl7.org/CodeSystem/adverse-event-seriousness', code: 'Non-serious', display: 'Non-serious' }) ] })
      expected.hasSeriousness = true
      expected.actuality = 'actual'
      expected.event = new CodableConceptModel({
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "304386008",
            "display": "O/E - itchy rash"
          }
        ],
        "text": "This was a mild rash on the left forearm"
      })
      expected.hasEvent = true

      expect(new AdverseEventModel(fixture)).toEqual(expected);
    });
  })
});
