import {AllergyIntoleranceModel} from './allergy-intolerance-model';
import {fhirVersions} from '../constants';

describe('AllergyIntoleranceModel', () => {
  it('should create an instance', () => {
    expect(new AllergyIntoleranceModel({})).toBeTruthy();
  });

  describe('with r4', () => {

    it('should parse example1.json', () => {
      let fixture = require("../../fixtures/r4/resources/allergyIntolerance/example1.json")
      let expected = new AllergyIntoleranceModel({})
      expected.title = 'Cashew nuts'
      expected.status = 'Confirmed'
      expected.recordedDate = '2014-10-09T14:58:00+11:00'
      expected.substanceCoding = [
        {
          "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
          "code": "1160593",
          "display": "cashew nut allergenic extract Injectable Product"
        }
      ]
      expected.asserter = {reference: 'Patient/example'}
      expected.note = [{text: 'The criticality is high becasue of the observed anaphylactic reaction when challenged with cashew extract.'}]
      expected.type = 'allergy'
      expected.category = ['food']
      expected.patient = {reference: 'Patient/example'}

      expect(new AllergyIntoleranceModel(fixture)).toEqual(expected);
    });

    it('should parse r4 example2.json', () => {
      let fixture = require("../../fixtures/r4/resources/allergyIntolerance/example2.json")
      let expected = new AllergyIntoleranceModel({})
      expected.title = 'Penicillin G'
      expected.status = 'Unconfirmed'
      expected.recordedDate = '2010-03-01'
      expected.substanceCoding = []
      // expected.asserter = { reference: 'Patient/example' }
      // expected.note = [{ text: 'The criticality is high becasue of the observed anaphylactic reaction when challenged with cashew extract.' }]
      // expected.type = ''
      expected.category = ['medication']
      expected.patient = {reference: 'Patient/example'}

      expect(new AllergyIntoleranceModel(fixture)).toEqual(expected);
    });

    it('should parse r4 example3.json', () => {
      let fixture = require("../../fixtures/r4/resources/allergyIntolerance/example3.json")
      let expected = new AllergyIntoleranceModel({})
      expected.title = 'No Known Allergy (situation)'
      expected.status = 'Confirmed'
      expected.recordedDate = '2015-08-06T15:37:31-06:00'
      expected.substanceCoding = []
      // expected.asserter = { reference: 'Patient/example' }
      // expected.note = [{ text: 'The criticality is high becasue of the observed anaphylactic reaction when challenged with cashew extract.' }]
      // expected.type = 'allergy'
      // expected.category = [ 'food' ]
      expected.patient = {reference: 'Patient/mom'}

      expect(new AllergyIntoleranceModel(fixture)).toEqual(expected);
    });
  })
  describe('with dstu2', () => {

    it('should parse example1.json', () => {
      let fixture = require("../../fixtures/dstu2/resources/allergyIntolerance/example1.json")
      let expected = new AllergyIntoleranceModel({})
      expected.title = "ALLERGENIC EXTRACT, PENICILLIN"
      expected.status = 'unconfirmed'
      expected.recordedDate = "2010-03-01"
      expected.substanceCoding = [
        {
          "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
          "code": "314422",
          "display": "ALLERGENIC EXTRACT, PENICILLIN"
        }
      ]
      // expected.asserter = {reference: 'Patient/example'}
      expected.note = []
      // expected.type = 'allergy'
      expected.category = ['medication']
      expected.patient = {reference: 'Patient/example'}

      expect(new AllergyIntoleranceModel(fixture, fhirVersions.DSTU2)).toEqual(expected);
    });

    it('should parse example2.json', () => {
      let fixture = require("../../fixtures/dstu2/resources/allergyIntolerance/example2.json")
      let expected = new AllergyIntoleranceModel({})
      expected.title = 'PENICILLINS'
      expected.status = 'confirmed'
      expected.recordedDate = '2008-02-22T06:00:00.000Z'
      expected.substanceCoding = [
        {
          "system": 'http://hl7.org/fhir/ndfrt' ,
          "code": 'N0000005840' ,
          "display": 'PENICILLINS'
        }
      ]
      // expected.asserter = {reference: 'Patient/example'}
      expected.note = []
      // expected.type = 'allergy'
      expected.category = []
      expected.patient = {reference: 'Patient/065b82c2aaa2'}

      expect(new AllergyIntoleranceModel(fixture, fhirVersions.DSTU2)).toEqual(expected);
    });

  })
  describe('with stu3', () => {

    it('should parse example1.json', () => {
      let fixture = require("../../fixtures/stu3/resources/allergyIntolerance/example1.json")
      let expected = new AllergyIntoleranceModel({})
      expected.title = 'Cashew nuts'
      expected.status = 'confirmed'
      expected.recordedDate = '2014-10-09T14:58:00+11:00'
      expected.substanceCoding = [
        {
          "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
          "code": "1160593",
          "display":  'cashew nut allergenic extract Injectable Product'
        }
      ]
      expected.asserter = {reference: 'Patient/example'}
      expected.note = [{ text: 'The criticality is high becasue of the observed anaphylactic reaction when challenged with cashew extract.' }]
      expected.type = 'allergy'
      expected.category = ['food']
      expected.patient = {reference: 'Patient/example'}

      expect(new AllergyIntoleranceModel(fixture, fhirVersions.STU3)).toEqual(expected);
    });

    it('should parse example2.json', () => {
      let fixture = require("../../fixtures/stu3/resources/allergyIntolerance/example2.json")
      let expected = new AllergyIntoleranceModel({})
      expected.title =  'Fish - dietary (substance)'
      expected.status = 'confirmed'
      expected.recordedDate = '2015-08-06T15:37:31-06:00'
      expected.substanceCoding = []
      // expected.asserter = {reference: 'Patient/example'}
      // expected.note = []
      // expected.type = 'allergy'
      expected.category = ['food']
      expected.patient = {reference: 'Patient/example'}

      expect(new AllergyIntoleranceModel(fixture, fhirVersions.STU3)).toEqual(expected);
    });

  })

});
