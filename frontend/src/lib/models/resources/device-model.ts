import {fhirVersions, ResourceType} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';

export class DeviceModel extends FastenDisplayModel {

  model: string | undefined
  status: string | undefined
  hasExpiry: boolean | undefined
  getExpiry: string | undefined
  getTypeCoding: string | undefined
  hasTypeCoding: boolean | undefined
  getUdi: string | undefined
  udiCarrierAIDC: string | undefined
  udiCarrierHRF: string | undefined
  safety: string | undefined
  hasSafety: boolean | undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.resourceType = ResourceType.Device
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }


  commonDTO(fhirResource:any){
    this.model = _.get(fhirResource, 'model', 'Device');
    this.status = _.get(fhirResource, 'status', '');
    this.getTypeCoding = _.get(fhirResource, 'type.coding');
    this.hasTypeCoding = Array.isArray(this.getTypeCoding);
  };

  dstu2DTO(fhirResource:any){
    this.getUdi = _.get(fhirResource, 'udi');
    this.hasExpiry = _.has(fhirResource, 'expiry');
    this.getExpiry = _.get(fhirResource, 'expiry');
  };

  stu3DTO(fhirResource:any){
    this.getUdi = _.get(fhirResource, 'udi.name');
    this.hasExpiry = _.has(fhirResource, 'expirationDate');
    this.getExpiry = _.get(fhirResource, 'expirationDate');
    this.safety = _.get(fhirResource, 'safety', []);
    this.hasSafety = hasValue(this.safety);
  };

  r4DTO(fhirResource:any){
    this.getUdi = _.get(fhirResource, 'udiCarrier.deviceIdentifier');
    this.hasExpiry = _.has(fhirResource, 'expirationDate');
    this.getExpiry = _.get(fhirResource, 'expirationDate');
    this.udiCarrierAIDC = _.get(fhirResource, 'udiCarrier.carrierAIDC');
    this.udiCarrierHRF = _.get(fhirResource, 'udiCarrier.carrierHRF');
    this.safety = _.get(fhirResource, 'safety', []);
    this.hasSafety = hasValue(this.safety);
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
