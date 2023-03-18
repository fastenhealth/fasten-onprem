import { DocumentReferenceModel } from './document-reference-model';
import {AdverseEventModel} from './adverse-event-model';
import {CodableConceptModel} from '../datatypes/codable-concept-model';
import * as example1Fixture from "../../fixtures/r4/resources/documentReference/example1.json"
import {BinaryModel} from './binary-model';


describe('DocumentReferenceModel', () => {
  it('should create an instance', () => {
    expect(new DocumentReferenceModel({})).toBeTruthy();
  });

  describe('with r4', () => {

    it('should parse example1.json', () => {
      let expected = new DocumentReferenceModel({})
      expected.description = 'Physical'
      expected.status =  'current'
      // expected.docStatus: string | undefined
      expected.type_coding = { system: 'http://loinc.org', code: '34108-1', display: 'Outpatient Note' }
      // expected.classCoding: string | undefined
      expected.category = new CodableConceptModel({
          "coding": [
            {
              "system": "http://ihe.net/xds/connectathon/classCodes",
              "code": "History and Physical",
              "display": "History and Physical"
            }
          ]
        })
      expected.content = [
        new BinaryModel({
          "contentType": "application/hl7-v3+xml",
          "language": "en-US",
          "url": "http://example.org/xds/mhd/Binary/07a6483f-732b-461e-86b6-edb665c45510",
          "size": 3654,
          "hash": "2jmj7l5rSw0yVb/vlWAYkK/YBwk=",
          "title": "Physical",
          "creation": "2005-12-24T09:35:00+11:00"
        })
      ]
      expected.created_at = '2005-12-24T09:43:41+11:00'
      expected.security_label_coding = { system: 'http://terminology.hl7.org/CodeSystem/v3-Confidentiality', code: 'V', display: 'very restricted' }
      expected.context = {
        eventCoding: { system: 'http://ihe.net/xds/connectathon/eventCodes', code: 'T-D8200', display: 'Arm' },
        facilityTypeCoding: { system: 'http://www.ihe.net/xds/connectathon/healthcareFacilityTypeCodes', code: 'Outpatient', display: 'Outpatient' },
        practiceSettingCoding: { system: 'http://www.ihe.net/xds/connectathon/practiceSettingCodes', code: 'General Medicine', display: 'General Medicine' },
        periodStart: '2004-12-23T08:00:00+11:00',
        periodEnd: '2004-12-23T08:01:00+11:00'
      }
      // expected.context: any | undefined

      expect(new DocumentReferenceModel(example1Fixture)).toEqual(expected);
    });
  })

});
