import {fhirVersions} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';

export class PractitionerModel extends FastenDisplayModel {

  identifier: string|undefined
  name: string|undefined
  gender: string|undefined
  status: string|undefined
  isContactData: boolean|undefined
  contactData: {
    name: string,
    relationship: string
  }|undefined
  telecom: string|undefined
  address: string|undefined
  birthDate: string|undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }


  commonDTO(fhirResource:any){
    const id = _.get(fhirResource, 'id', '');
    this.identifier = _.get(fhirResource, 'identifier', '');
    this.gender = _.get(fhirResource, 'gender', '');
    this.status = _.get(fhirResource, 'active') === true ? 'active' : '';
    this.isContactData = _.has(fhirResource, 'contact[0]');
    this.birthDate = _.get(fhirResource, 'birthDate');
    this.contactData = {
      name: _.get(fhirResource, 'contact[0].name'),
      relationship: _.get(fhirResource, 'contact[0].relationship[0].text'),
    };
  };

  dstu2DTO(fhirResource:any){
    this.name = _.get(fhirResource, 'name');
  };

  stu3DTO(fhirResource:any){
    this.name = _.get(fhirResource, 'name.0');
    this.address = _.get(fhirResource, 'address.0');
    this.telecom = _.get(fhirResource, 'telecom');
  };

  resourceDTO(fhirResource:any, fhirVersion:fhirVersions){
    switch (fhirVersion) {
      case fhirVersions.DSTU2: {
        this.commonDTO(fhirResource),
        this.dstu2DTO(fhirResource)
        return
      }
      case fhirVersions.STU3: {
        this.commonDTO(fhirResource)
        this.stu3DTO(fhirResource)
        return
      }
      case fhirVersions.R4: {
        // there are not any breaking changes between STU3 and R4 version
        this.commonDTO(fhirResource)
        this.stu3DTO(fhirResource)
        return
      }

      default:
        throw Error('Unrecognized the fhir version property type.');
    }
  };

}
