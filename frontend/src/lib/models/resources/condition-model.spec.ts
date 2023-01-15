import { ConditionModel } from './condition-model';
import {CareTeamModel} from './care-team-model';
import {CodableConceptModel} from '../datatypes/codable-concept-model';

import * as example1Fixture  from '../../fixtures/r4/resources/condition/example1.json';
import * as example2Fixture from '../../fixtures/r4/resources/condition/example2.json';
import * as example3Fixture from '../../fixtures/r4/resources/condition/example3.json';


describe('ConditionModel', () => {
  it('should create an instance', () => {
    expect(new ConditionModel({})).toBeTruthy();
  });
  describe('with r4', () => {

    it('should parse example1.json', () => {
      // let fixture = require("../../fixtures/r4/resources/condition/example1.json")
      let expected = new ConditionModel({})
      expected.code_text = 'Burn of ear'
      expected.severity_text = 'Severe'
      // expected.hasAsserter: boolean | undefined
      // expected.asserter: string | undefined
      expected.has_body_site = true
      expected.body_site = [new CodableConceptModel({
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "49521004",
            "display": "Left external ear structure"
          }
        ],
        "text": "Left Ear"
      })]
      expected.clinical_status = 'active'
      // expected.dateRecorded: string | undefined
      expected.onset_datetime = '2012-05-24'

      expect(new ConditionModel(example1Fixture)).toEqual(expected);
    });
    it('should parse example2.json', () => {

      let expected = new ConditionModel({})
      expected.code_text = 'Asthma'
      expected.severity_text = 'Mild'
      // expected.hasAsserter: boolean | undefined
      // expected.asserter: string | undefined
      expected.has_body_site = false
      // expected.bodySite
      expected.clinical_status = 'active'
      // expected.dateRecorded: string | undefined
      // expected.onsetDateTime = '2012-05-24'

      expect(new ConditionModel(example2Fixture)).toEqual(expected);
    });
    it('should parse example3.json', () => {
      let expected = new ConditionModel({})
      expected.code_text = 'Fever'
      expected.severity_text = 'Mild'
      expected.has_asserter = true
      expected.asserter = { reference: 'Practitioner/f201' }
      expected.has_body_site = true
      expected.body_site = [new CodableConceptModel({ text: '', coding: [ Object({ system: 'http://snomed.info/sct', code: '38266002', display: 'Entire body as a whole' }) ] })]
      expected.clinical_status = 'resolved'
      expected.date_recorded = '2013-04-04'
      expected.onset_datetime =  '2013-04-02'

      expect(new ConditionModel(example3Fixture)).toEqual(expected);
    });

  })

});
