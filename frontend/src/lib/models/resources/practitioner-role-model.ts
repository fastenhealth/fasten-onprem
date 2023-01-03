import {fhirVersions} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';

export class PractitionerRoleModel {
  codes: string|undefined
  status: string|undefined
  specialties: string|undefined
  organization: string|undefined
  practitioner: string|undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions) {
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }

  commonDTO(fhirResource:any){
    this.status = _.get(fhirResource, 'active') === true ? 'active' : '';
    this.codes = _.get(fhirResource, 'code', []);
    this.specialties = _.get(fhirResource, 'specialty', []);
    this.organization = _.get(fhirResource, 'organization');
    this.practitioner = _.get(fhirResource, 'practitioner');

  };

  resourceDTO(fhirResource: any, fhirVersion: fhirVersions){
    switch (fhirVersion) {
      case fhirVersions.STU3: {
        this.commonDTO(fhirResource)
        return
      }

      case fhirVersions.R4: {
        this.commonDTO(fhirResource)
        return
      }

      default:
        throw Error('Unrecognized the fhir version property type.');
    }
  };

}
