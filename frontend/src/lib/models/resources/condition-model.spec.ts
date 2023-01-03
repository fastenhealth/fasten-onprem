import { ConditionModel } from './condition-model';
import {CareTeamModel} from './care-team-model';
import {CodableConceptModel} from '../datatypes/codable-concept-model';

describe('ConditionModel', () => {
  it('should create an instance', () => {
    expect(new ConditionModel({})).toBeTruthy();
  });
  describe('with r4', () => {

    it('should parse example1.json', () => {
      let fixture = require("../../fixtures/r4/resources/condition/example1.json")
      let expected = new ConditionModel({})
      expected.codeText = 'Burn of ear'
      expected.severityText = 'Severe'
      // expected.hasAsserter: boolean | undefined
      // expected.asserter: string | undefined
      expected.hasBodySite = true
      expected.bodySite = [new CodableConceptModel({
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "49521004",
            "display": "Left external ear structure"
          }
        ],
        "text": "Left Ear"
      })]
      expected.clinicalStatus = 'active'
      // expected.dateRecorded: string | undefined
      expected.onsetDateTime = '2012-05-24'

      expect(new ConditionModel(fixture)).toEqual(expected);
    });
    it('should parse example2.json', () => {
      let fixture = require("../../fixtures/r4/resources/condition/example2.json")
      let expected = new ConditionModel({})
      expected.codeText = 'Asthma'
      expected.severityText = 'Mild'
      // expected.hasAsserter: boolean | undefined
      // expected.asserter: string | undefined
      expected.hasBodySite = false
      // expected.bodySite
      expected.clinicalStatus = 'active'
      // expected.dateRecorded: string | undefined
      // expected.onsetDateTime = '2012-05-24'

      expect(new ConditionModel(fixture)).toEqual(expected);
    });
    it('should parse example3.json', () => {
      let fixture = require("../../fixtures/r4/resources/condition/example3.json")
      let expected = new ConditionModel({})
      expected.codeText = 'Fever'
      expected.severityText = 'Mild'
      expected.hasAsserter = true
      expected.asserter = { reference: 'Practitioner/f201' }
      expected.hasBodySite = true
      expected.bodySite = [new CodableConceptModel({ text: '', coding: [ Object({ system: 'http://snomed.info/sct', code: '38266002', display: 'Entire body as a whole' }) ] })]
      expected.clinicalStatus = 'resolved'
      expected.dateRecorded = '2013-04-04'
      expected.onsetDateTime =  '2013-04-02'

      expect(new ConditionModel(fixture)).toEqual(expected);
    });

  })

});
