import { HumanNameModel } from './human-name-model';
import {AddressModel} from './address-model';
import * as fixture from "../../fixtures/r4/datatypes/human-name.json"

describe('HumanNameModel', () => {
  it('should create an instance', () => {
    expect(new HumanNameModel({})).toBeTruthy();
  });

  it('should parse fhirdata', () => {
    let expectedHumanName = new HumanNameModel({})
    expectedHumanName.givenName = 'Peter, James'
    expectedHumanName.familyName = 'Windsor'
    expectedHumanName.suffix = ''
    expectedHumanName.use = 'maiden'
    expectedHumanName.header = 'Peter, James Windsor'

    expect(new HumanNameModel(fixture)).toEqual(expectedHumanName);
  });
});
