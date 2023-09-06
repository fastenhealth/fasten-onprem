import {AllergyIntoleranceModel} from './allergy-intolerance-model';
import {fhirVersions} from '../constants';
import * as example1Fixture from "../../fixtures/r4/resources/allergyIntolerance/example1.json";
import * as example2Fixture from "../../fixtures/r4/resources/allergyIntolerance/example2.json";
import * as example3Fixture from "../../fixtures/r4/resources/allergyIntolerance/example3.json";

import * as example1DstuFixture from "../../fixtures/dstu2/resources/allergyIntolerance/example1.json"
import * as example2DstuFixture from "../../fixtures/dstu2/resources/allergyIntolerance/example2.json"
import * as example1Stu3Fixture from "../../fixtures/stu3/resources/allergyIntolerance/example1.json"
import * as example2Stu3Fixture from "../../fixtures/stu3/resources/allergyIntolerance/example2.json"

describe('AllergyIntoleranceModel', () => {
  it('should create an instance', () => {
    expect(new AllergyIntoleranceModel({})).toBeTruthy();
  });

  describe('with r4', () => {

    it('should parse example1.json', () => {
      let expected = new AllergyIntoleranceModel({})
      expected.title = 'Cashew nuts'
      expected.status = 'Confirmed'
      expected.recorded_date = '2014-10-09T14:58:00+11:00'
      expected.substance_coding = [
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
      expected.code = { coding: [{ system: 'http://snomed.info/sct', code: '227493005', display: 'Cashew nuts' } ] }
      expected.patient = {reference: 'Patient/example'}

      expect(new AllergyIntoleranceModel(example1Fixture)).toEqual(expected);
    });

    it('should parse r4 example2.json', () => {
      let expected = new AllergyIntoleranceModel({})
      expected.title = 'Penicillin G'
      expected.status = 'Unconfirmed'
      expected.recorded_date = '2010-03-01'
      expected.substance_coding = []
      // expected.asserter = { reference: 'Patient/example' }
      // expected.note = [{ text: 'The criticality is high becasue of the observed anaphylactic reaction when challenged with cashew extract.' }]
      // expected.type = ''
      expected.category = ['medication']
      expected.patient = {reference: 'Patient/example'}
      expected.code = { coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '7980', display: 'Penicillin G' } ] }

      expect(new AllergyIntoleranceModel(example2Fixture)).toEqual(expected);
    });

    it('should parse r4 example3.json', () => {
      let expected = new AllergyIntoleranceModel({})
      expected.title = 'No Known Allergy (situation)'
      expected.status = 'Confirmed'
      expected.recorded_date = '2015-08-06T15:37:31-06:00'
      expected.substance_coding = []
      // expected.asserter = { reference: 'Patient/example' }
      // expected.note = [{ text: 'The criticality is high becasue of the observed anaphylactic reaction when challenged with cashew extract.' }]
      // expected.type = 'allergy'
      // expected.category = [ 'food' ]
      expected.patient = {reference: 'Patient/mom'}
      expected.code = { coding: [{ system: 'http://snomed.info/sct', code: '716186003', display: 'No Known Allergy (situation)' } ], text: 'NKA' }

      expect(new AllergyIntoleranceModel(example3Fixture)).toEqual(expected);
    });
  })
  describe('with dstu2', () => {

    it('should parse example1.json', () => {
      let expected = new AllergyIntoleranceModel({})
      expected.title = "ALLERGENIC EXTRACT, PENICILLIN"
      expected.status = 'unconfirmed'
      expected.recorded_date = "2010-03-01"
      expected.substance_coding = [
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

      expect(new AllergyIntoleranceModel(example1DstuFixture, fhirVersions.DSTU2)).toEqual(expected);
    });

    it('should parse example2.json', () => {
      let expected = new AllergyIntoleranceModel({})
      expected.title = 'PENICILLINS'
      expected.status = 'confirmed'
      expected.recorded_date = '2008-02-22T06:00:00.000Z'
      expected.substance_coding = [
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

      expect(new AllergyIntoleranceModel(example2DstuFixture, fhirVersions.DSTU2)).toEqual(expected);
    });

  })
  describe('with stu3', () => {

    it('should parse example1.json', () => {

      let expected = new AllergyIntoleranceModel({})
      expected.title = 'Cashew nuts'
      expected.status = 'confirmed'
      expected.recorded_date = '2014-10-09T14:58:00+11:00'
      expected.substance_coding = [
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
      expected.code = { coding: [ { system: 'http://snomed.info/sct', code: '227493005', display: 'Cashew nuts' } ] }
      expect(new AllergyIntoleranceModel(example1Stu3Fixture, fhirVersions.STU3)).toEqual(expected);
    });

    it('should parse example2.json', () => {

      let expected = new AllergyIntoleranceModel({})
      expected.title =  'Fish - dietary (substance)'
      expected.status = 'confirmed'
      expected.recorded_date = '2015-08-06T15:37:31-06:00'
      expected.substance_coding = []
      // expected.asserter = {reference: 'Patient/example'}
      // expected.note = []
      // expected.type = 'allergy'
      expected.category = ['food']
      expected.patient = {reference: 'Patient/example'}
      expected.code = { coding: [{ system: 'http://snomed.info/sct', code: '227037002', display: 'Fish - dietary (substance)' }], text: 'Allergic to fresh fish. Tolerates canned fish' }

      expect(new AllergyIntoleranceModel(example2Stu3Fixture, fhirVersions.STU3)).toEqual(expected);
    });

  })

});
