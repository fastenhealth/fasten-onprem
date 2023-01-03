import { GoalModel } from './goal-model';
import {DocumentReferenceModel} from './document-reference-model';
import {CodableConceptModel} from '../datatypes/codable-concept-model';

describe('GoalModel', () => {
  it('should create an instance', () => {
    expect(new GoalModel({})).toBeTruthy();
  });

  describe('with r4', () => {

    it('should parse example1.json', () => {
      let fixture = require("../../fixtures/r4/resources/goal/example1.json")
      let expected = new GoalModel({})

      // expected.title: string | undefined
      expected.status = 'on-hold'
      expected.hasStatus = true
      expected.startDate = '2015-04-05'
      expected.hasCategory = true
      expected.category = [
        new CodableConceptModel({ coding: [ Object({ system: 'http://terminology.hl7.org/CodeSystem/goal-category', code: 'dietary' }) ] })
      ]
      // expected.hasUdi: boolean | undefined
      // expected.udi: string | undefined
      expected.addresses = [{ display: 'obesity condition' }]
      expected.hasAddresses = true
      // expected.author: string | undefined
      expected.description = 'Target weight is 160 to 180 lbs.'
      // expected.outcomeReference: string | undefined
      // expected.achievementStatus: string | undefined
      expected.priority = { system: 'http://terminology.hl7.org/CodeSystem/goal-priority', code: 'high-priority', display: 'High Priority' }
      expected.subject = { reference: 'Patient/example', display: 'Peter James Chalmers' }
      expected.statusDate = '2016-02-14'

      expect(new GoalModel(fixture)).toEqual(expected);
    });

    it('should parse example2.json', () => {
      let fixture = require("../../fixtures/r4/resources/goal/example2.json")
      let expected = new GoalModel({})

      // expected.title: string | undefined
      expected.status = 'completed'
      expected.hasStatus = true
      expected.startDate = '2015-04-05'
      expected.hasCategory = false
      // expected.hasUdi: boolean | undefined
      // expected.udi: string | undefined
      // expected.addresses = [{ display: 'obesity condition' }]
      expected.hasAddresses = false
      // expected.author: string | undefined
      expected.description = 'Stop smoking'
      // expected.outcomeReference: string | undefined
      expected.achievementStatus = { system: 'http://terminology.hl7.org/CodeSystem/goal-achievement', code: 'achieved', display: 'Achieved' }
      // expected.priority = { system: 'http://terminology.hl7.org/CodeSystem/goal-priority', code: 'high-priority', display: 'High Priority' }
      expected.subject = { reference: 'Patient/example', display: 'Peter James Chalmers' }
      // expected.statusDate = '2016-02-14'

      expect(new GoalModel(fixture)).toEqual(expected);
    });
  })

});
