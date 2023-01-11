import {fhirVersions, ResourceType} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';

export class AdverseEventModel extends FastenDisplayModel {
  subject: ReferenceModel | undefined
  description: string | undefined
  event_type: string | undefined
  has_event_type: boolean | undefined
  date: string | undefined
  seriousness: CodableConceptModel | undefined
  has_seriousness: boolean | undefined
  actuality: string | undefined
  event: CodableConceptModel | undefined
  has_event: boolean | undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.source_resource_type = ResourceType.AdverseEvent
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }


  commonDTO(fhirResource:any ){
    this.subject = _.get(fhirResource, 'subject');
    this.date = _.get(fhirResource, 'date');
    let seriousness = _.get(fhirResource, 'seriousness', [])
    this.seriousness = new CodableConceptModel(seriousness);
    this.has_seriousness = hasValue(seriousness);
  };

  stu3DTO(fhirResource:any){
    this.description = _.get(fhirResource, 'description');
    this.event_type = _.get(fhirResource, 'type', []);
    this.has_event_type = hasValue(this.event_type);
  };

  r4DTO(fhirResource:any){
    this.actuality = _.get(fhirResource, 'actuality');
    let event = _.get(fhirResource, 'event', [])
    this.event = new CodableConceptModel(event);
    this.has_event = hasValue(event);
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
