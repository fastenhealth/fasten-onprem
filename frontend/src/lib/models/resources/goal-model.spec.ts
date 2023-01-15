import { GoalModel } from './goal-model';
import {DocumentReferenceModel} from './document-reference-model';
import {CodableConceptModel} from '../datatypes/codable-concept-model';

import * as example1Fixture from "../../fixtures/r4/resources/goal/example1.json"
import * as example2Fixture from "../../fixtures/r4/resources/goal/example2.json"

describe('GoalModel', () => {
  it('should create an instance', () => {
    expect(new GoalModel({})).toBeTruthy();
  });

  describe('with r4', () => {

    it('should parse example1.json', () => {
      let expected = new GoalModel({})

      // expected.title: string | undefined
      expected.status = 'on-hold'
      expected.has_status = true
      expected.start_date = '2015-04-05'
      expected.has_category = true
      expected.category = [
        new CodableConceptModel({ coding: [ Object({ system: 'http://terminology.hl7.org/CodeSystem/goal-category', code: 'dietary' }) ] })
      ]
      // expected.hasUdi: boolean | undefined
      // expected.udi: string | undefined
      expected.addresses = [{ display: 'obesity condition' }]
      expected.has_addresses = true
      // expected.author: string | undefined
      expected.description = 'Target weight is 160 to 180 lbs.'
      // expected.outcomeReference: string | undefined
      // expected.achievementStatus: string | undefined
      expected.priority = { system: 'http://terminology.hl7.org/CodeSystem/goal-priority', code: 'high-priority', display: 'High Priority' }
      expected.subject = { reference: 'Patient/example', display: 'Peter James Chalmers' }
      expected.status_date = '2016-02-14'

      expect(new GoalModel(example1Fixture)).toEqual(expected);
    });

    it('should parse example2.json', () => {
      let expected = new GoalModel({})

      // expected.title: string | undefined
      expected.status = 'completed'
      expected.has_status = true
      expected.start_date = '2015-04-05'
      expected.has_category = false
      // expected.hasUdi: boolean | undefined
      // expected.udi: string | undefined
      // expected.addresses = [{ display: 'obesity condition' }]
      expected.has_addresses = false
      // expected.author: string | undefined
      expected.description = 'Stop smoking'
      // expected.outcomeReference: string | undefined
      expected.achievement_status = { system: 'http://terminology.hl7.org/CodeSystem/goal-achievement', code: 'achieved', display: 'Achieved' }
      // expected.priority = { system: 'http://terminology.hl7.org/CodeSystem/goal-priority', code: 'high-priority', display: 'High Priority' }
      expected.subject = { reference: 'Patient/example', display: 'Peter James Chalmers' }
      // expected.statusDate = '2016-02-14'

      expect(new GoalModel(example2Fixture)).toEqual(expected);
    });
  })

});
