import {fhirVersions, ResourceType} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';

export class DeviceModel extends FastenDisplayModel {
  code: CodableConceptModel | undefined

  model: string | undefined
  status: string | undefined
  has_expiry: boolean | undefined
  get_expiry: string | undefined
  get_type_coding: string | undefined
  has_type_coding: boolean | undefined
  get_udi: string | undefined
  udi_carrier_aidc: string | undefined
  udi_carrier_hrf: string | undefined
  safety: string | undefined
  has_safety: boolean | undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.source_resource_type = ResourceType.Device
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }


  commonDTO(fhirResource:any){
    this.code = _.get(fhirResource, 'type');
    this.model = _.get(fhirResource, 'model') || _.get(fhirResource,"code.text") || _.get(fhirResource,"code.coding.0.display") || 'Unknown Device';
    this.status = _.get(fhirResource, 'status', '');
    this.get_type_coding = _.get(fhirResource, 'type.coding');
    this.has_type_coding = Array.isArray(this.get_type_coding);
  };

  dstu2DTO(fhirResource:any){
    this.get_udi = _.get(fhirResource, 'udi');
    this.has_expiry = _.has(fhirResource, 'expiry');
    this.get_expiry = _.get(fhirResource, 'expiry');
  };

  stu3DTO(fhirResource:any){
    this.get_udi = _.get(fhirResource, 'udi.name');
    this.has_expiry = _.has(fhirResource, 'expirationDate');
    this.get_expiry = _.get(fhirResource, 'expirationDate');
    this.safety = _.get(fhirResource, 'safety', []);
    this.has_safety = hasValue(this.safety);
  };

  r4DTO(fhirResource:any){
    this.get_udi = _.get(fhirResource, 'udiCarrier.deviceIdentifier');
    this.has_expiry = _.has(fhirResource, 'expirationDate');
    this.get_expiry = _.get(fhirResource, 'expirationDate');
    this.udi_carrier_aidc = _.get(fhirResource, 'udiCarrier.carrierAIDC');
    this.udi_carrier_hrf = _.get(fhirResource, 'udiCarrier.carrierHRF');
    this.safety = _.get(fhirResource, 'safety', []);
    this.has_safety = hasValue(this.safety);
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
        this.commonDTO(fhirResource)
        this.r4DTO(fhirResource)
        return
      }

      default:
        throw Error('Unrecognized the fhir version property type.');
    }
  };
}
