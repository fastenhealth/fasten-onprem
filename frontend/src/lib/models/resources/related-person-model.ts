import {fhirVersions, ResourceType} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';

export class RelatedPersonModel extends FastenDisplayModel {

  patient: string|undefined
  name: string|undefined
  birthDate: string|undefined
  gender: string|undefined
  address: string|undefined
  relatedPersonTelecom: string|undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.resourceType = ResourceType.RelatedPerson

    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }


  commonDTO(fhirResource:any){
    this.patient = _.get(fhirResource, 'patient');
    this.birthDate = _.get(fhirResource, 'birthDate');
    this.gender = _.get(fhirResource, 'gender');
    this.address = _.get(fhirResource, 'address[0]');
    this.relatedPersonTelecom = _.get(fhirResource, 'telecom', []).filter(
        (telecom: any) => telecom.system === 'phone',
    );
  };

  dstu2DTO(fhirResource:any){
    this.name = _.get(fhirResource, 'name');
  };

  stu3r4DTO(fhirResource:any){
    this.name = _.get(fhirResource, 'name')[0];
  };

  resourceDTO(fhirResource:any, fhirVersion:fhirVersions){
    switch (fhirVersion) {
      case fhirVersions.DSTU2: {
        this.commonDTO(fhirResource)
        this.dstu2DTO(fhirResource)
        return
      }

      case fhirVersions.STU3:
      case fhirVersions.R4: {
        this.commonDTO(fhirResource)
        this.stu3r4DTO(fhirResource)
        return
      }

      default:
        throw Error('Unrecognized the fhir version property type.');
    }
  };
}
