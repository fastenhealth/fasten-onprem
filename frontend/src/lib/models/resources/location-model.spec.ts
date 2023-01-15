import { LocationModel } from './location-model';
import {HumanNameModel} from '../datatypes/human-name-model';
import {AddressModel} from '../datatypes/address-model';
import {CodableConceptModel} from '../datatypes/codable-concept-model';
import {fhirVersions} from '../constants';
import * as example1Fixture from "../../fixtures/r4/resources/location/example1.json"
import * as example2Fixture from "../../fixtures/r4/resources/location/example2.json"
import * as example1Dstu2Fixture from "../../fixtures/dstu2/resources/location/example1.json"

describe('LocationModel', () => {
  it('should create an instance', () => {
    expect(new LocationModel({})).toBeTruthy();
  });

  describe('with r4', () => {
    it('should parse example1.json', () => {
      let expectedLocation = new LocationModel({})
      expectedLocation.name = 'South Wing, second floor'
      expectedLocation.status = 'active'
      expectedLocation.description = 'Second floor of the Old South Wing, formerly in use by Psychiatry'
      expectedLocation.mode = "instance"
      expectedLocation.managing_organization = {"reference": "Organization/f001"}
      expectedLocation.address = new AddressModel({
        city: "Den Burg",
        line: ['Galapagosweg 91, Building A'],
        country: "NLD",
        postalCode: "9105 PZ"
      })
      expectedLocation.telecom = [
        {system: 'phone', value: '2328', use: 'work'},
        {system: 'fax', value: '2329', use: 'work'},
        {system: 'email', value: 'second wing admissions'},
        {system: 'url', value: 'http://sampleorg.com/southwing', use: 'work'}
      ]
      expectedLocation.type = []
      expectedLocation.physical_type = new CodableConceptModel({
        text: '',
        coding: [
          {
            "system": "http://terminology.hl7.org/CodeSystem/location-physical-type",
            "code": "wi",
            "display": "Wing"
          }
        ]
      })

      expect(new LocationModel(example1Fixture)).toEqual(expectedLocation);
    });

    it('should parse example2.json', () => {
      let expectedLocation = new LocationModel({})
      expectedLocation.name = 'BUMC Ambulance'
      expectedLocation.status = 'active'
      expectedLocation.description = "Ambulance provided by Burgers University Medical Center"
      expectedLocation.mode = "kind"
      expectedLocation.managing_organization = {"reference": "Organization/f001"}
      expectedLocation.telecom = [
        {system: 'phone', value: '2329', use: 'mobile'}
      ]
      expectedLocation.type = [new CodableConceptModel({
        text: '',
        coding: [
          {
            "system": "http://terminology.hl7.org/CodeSystem/v3-RoleCode",
            "code": "AMB",
            "display": "Ambulance"
          }
        ]
      })]
      expectedLocation.physical_type = new CodableConceptModel({
        text: '',
        coding: [
          {
            "system": "http://terminology.hl7.org/CodeSystem/location-physical-type",
            "code": "ve",
            "display": "Vehicle"
          }
        ]
      })

      expect(new LocationModel(example2Fixture)).toEqual(expectedLocation);
    });
  })

  describe('with dstu2', () => {

    it('should parse example1.json', () => {
      let expectedLocation = new LocationModel({})
      expectedLocation.name = "South Wing, second floor"
      expectedLocation.status = 'active'
      expectedLocation.description = "Second floor of the Old South Wing, formerly in use by Psychiatry"
      expectedLocation.mode = "instance"
      expectedLocation.managing_organization = {"reference": "Organization/f001"}
      expectedLocation.telecom = [
        {
          "system": "phone",
          "value": "2328",
          "use": "work"
        },
        {
          "system": "fax",
          "value": "2329",
          "use": "work"
        },
        {
          "system": "email",
          "value": "second wing admissions"
        },
        {
          "system": "other",
          "value": "http://sampleorg.com/southwing",
          "use": "work"
        }
      ]
      expectedLocation.address = new AddressModel({
        "use": "work",
        "line": [
          "Galapagosweg 91, Building A"
        ],
        "city": "Den Burg",
        "postalCode": "9105 PZ",
        "country": "NLD"
      })
      expectedLocation.physical_type = new CodableConceptModel({
        text: '',
        coding: [
          {
            "system": "http://hl7.org/fhir/location-physical-type",
            "code": "wi",
            "display": "Wing"
          }
        ]
      })

      expect(new LocationModel(example1Dstu2Fixture, fhirVersions.DSTU2)).toEqual(expectedLocation);
    });
  })
});
