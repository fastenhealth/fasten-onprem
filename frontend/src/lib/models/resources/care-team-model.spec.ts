import { CareTeamModel } from './care-team-model';
import {CarePlanModel} from './care-plan-model';
import {ReferenceModel} from '../datatypes/reference-model';

import * as fixture from "../../fixtures/r4/resources/careTeam/example1.json"


describe('CareTeamModel', () => {
  it('should create an instance', () => {
    expect(new CareTeamModel({})).toBeTruthy();
  });

  describe('with r4', () => {

    it('should parse example1.json', () => {
      let expected = new CareTeamModel({})
      expected.name = "Peter James Charlmers Care Plan for Inpatient Encounter"
      expected.status = "active"
      // expected.periodStart
      expected.period_end = "2013-01-01"
      // expected.participants
      expected.category = [
        { coding: [
          { system: 'http://loinc.org', code: 'LA27976-2', display: 'Encounter-focused care team' }
          ]
        }
      ]
      expected.subject = {
        "reference": "Patient/example",
        "display": "Peter James Chalmers"
      }
      expected.encounter = {
        "reference": "Encounter/example"
      }
      expected.managing_organization = { reference: 'Organization/f001' }
      expected.participants = [
        {
          display: 'Peter James Chalmers',
          role: "responsiblePerson",
          periodStart: undefined,
          periodEnd: undefined,
          reference: {reference: 'Patient/example', display: 'Peter James Chalmers' }
        },
        {
          display: 'Dorothy Dietition',
          role: 'adviser',
          periodStart: undefined,
          periodEnd: '2013-01-01',
          reference: {
            "reference": "#pr1",
            "display": "Dorothy Dietition"
          }
        }
      ]

      expect(new CareTeamModel(fixture)).toEqual(expected);
    });
  })

});
