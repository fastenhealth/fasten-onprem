import {fhirVersions} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';

export class AdverseEventModel extends FastenDisplayModel {

  subject: ReferenceModel | undefined
  description: string | undefined
  eventType: string | undefined
  hasEventType: boolean | undefined
  date: string | undefined
  seriousness: CodableConceptModel | undefined
  hasSeriousness: boolean | undefined
  actuality: string | undefined
  event: CodableConceptModel | undefined
  hasEvent: boolean | undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }


  commonDTO(fhirResource:any ){
    this.subject = _.get(fhirResource, 'subject');
    this.date = _.get(fhirResource, 'date');
    let seriousness = _.get(fhirResource, 'seriousness', [])
    this.seriousness = new CodableConceptModel(seriousness);
    this.hasSeriousness = hasValue(seriousness);
  };

  stu3DTO(fhirResource:any){
    this.description = _.get(fhirResource, 'description');
    this.eventType = _.get(fhirResource, 'type', []);
    this.hasEventType = hasValue(this.eventType);
  };

  r4DTO(fhirResource:any){
    this.actuality = _.get(fhirResource, 'actuality');
    let event = _.get(fhirResource, 'event', [])
    this.event = new CodableConceptModel(event);
    this.hasEvent = hasValue(event);
  };

  resourceDTO(fhirResource: any, fhirVersion: fhirVersions){
    switch (fhirVersion) {
      case fhirVersions.STU3:
        this.commonDTO(fhirResource)
        this.stu3DTO(fhirResource)
        return
      case fhirVersions.R4:
        this.commonDTO(fhirResource)
        this.r4DTO(fhirResource)
        return
      default:
        break;
    }
  };
}
