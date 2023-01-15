import { DeviceModel } from './device-model';
import {AdverseEventModel} from './adverse-event-model';
import {CodableConceptModel} from '../datatypes/codable-concept-model';
import * as fixture from "../../fixtures/r4/resources/device/example1.json"
import * as fixture2 from "../../fixtures/r4/resources/device/example2.json"


describe('DeviceModel', () => {
  it('should create an instance', () => {
    expect(new DeviceModel({})).toBeTruthy();
  });

  describe('with r4', () => {

    it('should parse example1.json', () => {
      let expected = new DeviceModel({})


      expect(new DeviceModel(fixture)).toEqual(expected);
    });

    it('should parse example2.json', () => {
      let expected = new DeviceModel({})
      expected.status = 'active'


      expect(new DeviceModel(fixture2)).toEqual(expected);
    });
  })

});
