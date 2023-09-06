import { DiagnosticReportModel } from './diagnostic-report-model';
import {DeviceModel} from './device-model';
import {CodableConceptModel} from '../datatypes/codable-concept-model';
import example1Fixture from "../../fixtures/r4/resources/diagnosticReport/example1.json"


describe('DiagnosticReportModel', () => {
  it('should create an instance', () => {
    expect(new DiagnosticReportModel({})).toBeTruthy();
  });

  describe('with r4', () => {

    it('should parse example1.json', () => {
      let expected = new DiagnosticReportModel({})

      expected.title = 'Complete blood count (hemogram) panel - Blood by Automated count'
      expected.status = 'final'
      // expected.effectiveDateTime: string | undefined
      expected.category_coding = [
        { system: 'http://snomed.info/sct', code: '252275004', display: 'Haematology test' },
        { system: 'http://hl7.org/fhir/v2/0074', code: 'HM' }
      ]
      expected.code_coding =  [
        { system: 'http://loinc.org', code: '58410-2', display: 'Complete blood count (hemogram) panel - Blood by Automated count' }
      ]
      expected.has_category_coding = true
      expected.has_performer = true
      expected.conclusion = 'Core lab'
      expected.performer = { reference: 'Organization/f001', display: 'Burgers University Medical Centre' }
      expected.issued = '2013-05-15T19:32:52+01:00'
      expected.code = { coding: [{ system: 'http://loinc.org', code: '58410-2', display: 'Complete blood count (hemogram) panel - Blood by Automated count' } ] }

      expect(new DiagnosticReportModel(example1Fixture)).toEqual(expected);
    });

    // it('should parse example2.json', () => {
    //   let fixture = require("../../fixtures/r4/resources/device/example2.json")
    //   let expected = new DeviceModel({})
    //   expected.status = 'active'
    //
    //
    //   expect(new DeviceModel(fixture)).toEqual(expected);
    // });
  })

});
