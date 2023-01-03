import { AddressModel } from './address-model';

describe('AddressModel', () => {
  it('should create an instance', () => {
    expect(new AddressModel({})).toBeTruthy();
  });

  it('should parse fhirdata', () => {
    let fixture = require("../../fixtures/r4/datatypes/address.json")
    let expectedAddress = new AddressModel({})
    expectedAddress.city = "SALEM"
    expectedAddress.country = "US"
    expectedAddress.line = ["254 ESSEX ST"]
    expectedAddress.postalCode ="01970-3411"
    expectedAddress.state ="MA"

    expect(new AddressModel(fixture)).toEqual(expectedAddress);
  });
});
