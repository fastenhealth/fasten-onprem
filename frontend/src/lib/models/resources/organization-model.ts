import {fhirVersions, ResourceType} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';

export class OrganizationModel extends FastenDisplayModel {

  identifier: string|undefined
  name: string|undefined
  addresses: string|undefined
  telecom: string|undefined
  type_codings: any[]|undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.source_resource_type = ResourceType.Organization
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }


  commonDTO(fhirResource:any){
    this.identifier = _.get(fhirResource, 'identifier', '');
    this.name = _.get(fhirResource, 'name');
    this.addresses = _.get(fhirResource, 'address');
    this.telecom = _.get(fhirResource, 'telecom');
  };
  dstu2DTO(fhirResource:any){
    this.type_codings = _.get(fhirResource, 'type.coding');
  };
  stu3DTO(fhirResource:any){
    let typeCodings = _.get(fhirResource, 'type', []).map((type: { coding: any; }) => type.coding);
    this.type_codings = _.flatten(typeCodings)
  };

  resourceDTO(fhirResource:any, fhirVersion:fhirVersions){
    switch (fhirVersion) {
      case fhirVersions.DSTU2: {
        this.commonDTO(fhirResource)
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
