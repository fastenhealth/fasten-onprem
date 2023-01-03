import { DiagnosticReportModel } from './diagnostic-report-model';
import {DeviceModel} from './device-model';
import {CodableConceptModel} from '../datatypes/codable-concept-model';

describe('DiagnosticReportModel', () => {
  it('should create an instance', () => {
    expect(new DiagnosticReportModel({})).toBeTruthy();
  });

  describe('with r4', () => {

    it('should parse example1.json', () => {
      let fixture = require("../../fixtures/r4/resources/diagnosticReport/example1.json")
      let expected = new DiagnosticReportModel({})

      expected.title = 'Complete blood count (hemogram) panel - Blood by Automated count'
      expected.status = 'final'
      // expected.effectiveDateTime: string | undefined
      expected.categoryCoding = [
        { system: 'http://snomed.info/sct', code: '252275004', display: 'Haematology test' },
        { system: 'http://hl7.org/fhir/v2/0074', code: 'HM' }
      ]
      expected.hasCategoryCoding = true
      expected.hasPerformer = true
      expected.conclusion = 'Core lab'
      expected.performer = { reference: 'Organization/f001', display: 'Burgers University Medical Centre' }
      expected.issued = '2013-05-15T19:32:52+01:00'

      expect(new DiagnosticReportModel(fixture)).toEqual(expected);
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
