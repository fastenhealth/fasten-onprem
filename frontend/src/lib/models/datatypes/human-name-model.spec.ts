import { HumanNameModel } from './human-name-model';
import {AddressModel} from './address-model';

describe('HumanNameModel', () => {
  it('should create an instance', () => {
    expect(new HumanNameModel({})).toBeTruthy();
  });

  it('should parse fhirdata', () => {
    let fixture = require("../../fixtures/r4/datatypes/human-name.json")
    let expectedHumanName = new HumanNameModel({})
    expectedHumanName.givenName = 'Peter, James'
    expectedHumanName.familyName = 'Windsor'
    expectedHumanName.suffix = ''
    expectedHumanName.use = 'maiden'
    expectedHumanName.header = 'Peter, James Windsor'

    expect(new HumanNameModel(fixture)).toEqual(expectedHumanName);
  });
});
