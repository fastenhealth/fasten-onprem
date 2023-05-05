import { ExplanationOfBenefitModel } from './explanation-of-benefit-model';
import {CodableConceptModel} from '../datatypes/codable-concept-model';

import * as example1Fixture from "../../fixtures/r4/resources/explanationOfBenefit/c4bbExample.json"
import * as example2Fixture from "../../fixtures/r4/resources/explanationOfBenefit/c4bbExtendedDiagnosis.json"
import * as example3Fixture from "../../fixtures/r4/resources/explanationOfBenefit/eobForClaimWithErrors.json"
import * as example4Fixture from "../../fixtures/r4/resources/explanationOfBenefit/personPrimaryCoverage.json"

describe('ExplanationOfBenefitModel', () => {
  it('should create an instance', () => {
    expect(new ExplanationOfBenefitModel({})).toBeTruthy();
  });

  describe('with r4', () => {

    // it('should parse example1.json', () => {
    //   let expected = new ExplanationOfBenefitModel({})
    //
    //   // expected.title: string | undefined
    //   // expected.status = 'on-hold'
    //   // expected.has_status = true
    //   // expected.start_date = '2015-04-05'
    //   // expected.has_category = true
    //   // expected.category = [
    //   //   new CodableConceptModel({ coding: [ Object({ system: 'http://terminology.hl7.org/CodeSystem/goal-category', code: 'dietary' }) ] })
    //   // ]
    //   // // expected.hasUdi: boolean | undefined
    //   // // expected.udi: string | undefined
    //   // expected.addresses = [{ display: 'obesity condition' }]
    //   // expected.has_addresses = true
    //   // // expected.author: string | undefined
    //   // expected.description = 'Target weight is 160 to 180 lbs.'
    //   // // expected.outcomeReference: string | undefined
    //   // // expected.achievementStatus: string | undefined
    //   // expected.priority = { system: 'http://terminology.hl7.org/CodeSystem/goal-priority', code: 'high-priority', display: 'High Priority' }
    //   // expected.subject = { reference: 'Patient/example', display: 'Peter James Chalmers' }
    //   // expected.status_date = '2016-02-14'
    //
    //   expect(new ExplanationOfBenefitModel(example1Fixture)).toEqual(expected);
    // });
    //
    // it('should parse example2.json', () => {
    //   let expected = new ExplanationOfBenefitModel({})
    //
    //   // expected.title: string | undefined
    //   // expected.status = 'completed'
    //   // expected.has_status = true
    //   // expected.start_date = '2015-04-05'
    //   // expected.has_category = false
    //   // // expected.hasUdi: boolean | undefined
    //   // // expected.udi: string | undefined
    //   // // expected.addresses = [{ display: 'obesity condition' }]
    //   // expected.has_addresses = false
    //   // // expected.author: string | undefined
    //   // expected.description = 'Stop smoking'
    //   // // expected.outcomeReference: string | undefined
    //   // expected.achievement_status = { system: 'http://terminology.hl7.org/CodeSystem/goal-achievement', code: 'achieved', display: 'Achieved' }
    //   // // expected.priority = { system: 'http://terminology.hl7.org/CodeSystem/goal-priority', code: 'high-priority', display: 'High Priority' }
    //   // expected.subject = { reference: 'Patient/example', display: 'Peter James Chalmers' }
    //   // // expected.statusDate = '2016-02-14'
    //
    //   expect(new ExplanationOfBenefitModel(example2Fixture)).toEqual(expected);
    // });
    // it('should parse example3.json', () => {
    //   let expected = new ExplanationOfBenefitModel({})
    //
    //   // expected.title: string | undefined
    //   // expected.status = 'completed'
    //   // expected.has_status = true
    //   // expected.start_date = '2015-04-05'
    //   // expected.has_category = false
    //   // // expected.hasUdi: boolean | undefined
    //   // // expected.udi: string | undefined
    //   // // expected.addresses = [{ display: 'obesity condition' }]
    //   // expected.has_addresses = false
    //   // // expected.author: string | undefined
    //   // expected.description = 'Stop smoking'
    //   // // expected.outcomeReference: string | undefined
    //   // expected.achievement_status = { system: 'http://terminology.hl7.org/CodeSystem/goal-achievement', code: 'achieved', display: 'Achieved' }
    //   // // expected.priority = { system: 'http://terminology.hl7.org/CodeSystem/goal-priority', code: 'high-priority', display: 'High Priority' }
    //   // expected.subject = { reference: 'Patient/example', display: 'Peter James Chalmers' }
    //   // // expected.statusDate = '2016-02-14'
    //
    //   expect(new ExplanationOfBenefitModel(example3Fixture)).toEqual(expected);
    // });
    it('should parse example4.json', () => {
      let expected = new ExplanationOfBenefitModel({})

      expected.disposition = 'Claim settled as per contract.'
      expected.created = '2014-08-16'
      expected.insurer = { reference: 'Organization/3' }
      expected.hasInsurer = true
      expected.type= [{ system: 'http://terminology.hl7.org/CodeSystem/claim-type', code: 'oral' }]
      expected.hasType = true
      expected.resourceStatus = 'active'
      expected.useCode = 'claim'
      expected.patient = { reference: 'Patient/pat1' }
      expected.provider = { reference: 'Practitioner/1' }
      expected.total = [
        { category: Object({ coding: [ Object({ code: 'submitted' }) ] }), amount: Object({ value: 135.57, currency: 'USD' }) },
        { category: Object({ coding: [ Object({ code: 'benefit' }) ] }), amount: Object({ value: 96, currency: 'USD' }) }
      ]
      expected.hasTotal = true
      expected.services = [
        { coding: Object({ system: 'http://terminology.hl7.org/CodeSystem/ex-USCLS', code: '1205' }), servicedDate: '2014-08-16', servicedPeriod: undefined, quantity: undefined, itemCost: Object({ value: 135.57, currency: 'USD' }) },
        { coding: Object({ code: 'group' }), servicedDate: '2014-08-16', servicedPeriod: undefined, quantity: undefined, itemCost: Object({ value: 200, currency: 'USD' }) },
      ]
      expected.hasServices = true
      expected.insurance = Object({ reference: 'Coverage/9876B1' })

      expect(new ExplanationOfBenefitModel(example4Fixture)).toEqual(expected);
    });
  })

});
