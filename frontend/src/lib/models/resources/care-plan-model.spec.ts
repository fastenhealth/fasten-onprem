import { CarePlanModel } from './care-plan-model';

describe('CarePlanModel', () => {
  it('should create an instance', () => {
    expect(new CarePlanModel({})).toBeTruthy();
  });

  describe('with r4', () => {

    it('should parse heartOperationPlan.json', () => {
      let fixture = require("../../fixtures/r4/resources/carePlan/heartOperationPlan.json")
      let expected = new CarePlanModel({})
      expected.status = "completed"
      // expected.expiry = "completed"
      // expected.category = "completed"
      expected.goals = [ { reference: '#goal' } ]
      expected.hasGoals = true
      expected.addresses = [ { reference: "Condition/f201", display: '?????' } ]
      expected.hasAddresses = true
      expected.activity = [
        {
          title: '64915003',
          hasCategories: true,
          categories: [
            { system: 'http://snomed.info/sct', code: '64915003', display: 'Operation on heart' }
          ]
        }
      ]
      expected.hasActivity = true
      expected.subject = {"reference": "Patient/f001", display: 'P. van de Heuvel'}
      expected.periodStart = "2011-06-26"
      expected.periodEnd = "2011-06-27"
      // expected.basedOn

      // expected.title = 'Cashew nuts'
      // expected.status = 'Confirmed'
      // expected.recordedDate = '2014-10-09T14:58:00+11:00'
      // expected.substanceCoding = [
      //   {
      //     "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
      //     "code": "1160593",
      //     "display": "cashew nut allergenic extract Injectable Product"
      //   }
      // ]
      // expected.asserter = {reference: 'Patient/example'}
      // expected.note = [{text: 'The criticality is high becasue of the observed anaphylactic reaction when challenged with cashew extract.'}]
      // expected.type = 'allergy'
      // expected.category = ['food']
      // expected.patient = {reference: 'Patient/example'}

      expect(new CarePlanModel(fixture)).toEqual(expected);
    });

    it('should parse pregnancyPlan.json', () => {
      let fixture = require("../../fixtures/r4/resources/carePlan/pregnancyPlan.json")
      let expected = new CarePlanModel({})
      expected.status = "active"
      // expected.expiry = "completed"
      // expected.category = "completed"
      expected.goals = [ { reference: '#goal' } ]
      expected.hasGoals = true
      expected.addresses = [ { reference: '#p1', "display": "pregnancy" } ]
      expected.hasAddresses = true
      expected.activity = [
        { title: undefined, hasCategories: false, categories: [  ] },
        { title: 'First Antenatal encounter', hasCategories: true, categories: [ { system: 'http://example.org/mySystem', code: '1an' } ] },
        { title: 'Follow-up Antenatal encounter', hasCategories: true, categories: [ { system: 'http://example.org/mySystem', code: 'an' } ] },
        { title: 'Delivery', hasCategories: true, categories: [ { system: 'http://example.org/mySystem', code: 'del' } ] }
      ]
      expected.hasActivity = true
      expected.subject = {display: 'Eve Everywoman', reference: "Patient/1"}
      expected.periodStart = '2013-01-01'
      expected.periodEnd = '2013-10-01'

      expect(new CarePlanModel(fixture)).toEqual(expected);
    });

    it('should parse weightLossPlan.json', () => {
      let fixture = require("../../fixtures/r4/resources/carePlan/weightLossPlan.json")
      let expected = new CarePlanModel({})
      expected.status = "active"
      // expected.expiry = "completed"
      expected.category = [{ text: 'Weight management plan' }]
      expected.goals = [ { reference: 'Goal/example' } ]
      expected.hasGoals = true
      expected.addresses = [
        { reference: '#p1', display: 'obesity' }
      ]
      expected.hasAddresses = true
      expected.activity = [
        { title: '3141-9', hasCategories: true, categories: [ Object({ system: 'http://loinc.org', code: '3141-9', display: 'Weight Measured' }), Object({ system: 'http://snomed.info/sct', code: '27113001', display: 'Body weight' }) ] }

      ]
      expected.hasActivity = true
      expected.description = 'Manage obesity and weight loss'
      expected.subject = {display: 'Peter James Chalmers', reference: 'Patient/example'}
      // expected.periodStart = '2013-01-01'
      expected.periodEnd = '2017-06-01'
      expected.author = { reference: 'Practitioner/example', display: 'Dr Adam Careful' }
      expect(new CarePlanModel(fixture)).toEqual(expected);
    });

  })
});
