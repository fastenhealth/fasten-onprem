import {fhirVersions, ResourceType} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';

export class GoalModel extends FastenDisplayModel {

  title: string | undefined
  status: string | undefined
  has_status: boolean | undefined
  start_date: string | undefined
  has_category: boolean | undefined
  category: CodableConceptModel[] | undefined
  has_udi: boolean | undefined
  udi: string | undefined
  addresses: any[] | undefined
  has_addresses: boolean | undefined
  author: string | undefined
  description: string | undefined
  outcome_reference: string | undefined
  achievement_status: CodingModel | undefined
  priority: CodingModel | undefined
  subject: ReferenceModel | undefined
  status_date: string | undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.source_resource_type = ResourceType.Goal
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }

  commonDTO(fhirResource: any){
    this.title = _.get(fhirResource, 'note[0].text', 'Goal');
    this.status = _.get(fhirResource, 'status', '');
    this.has_status = _.has(fhirResource, 'status');
    this.start_date = _.get(fhirResource, 'startDate');
    let category = _.get(fhirResource, 'category');
    if(category){
      this.category = category.map((cat:any) => new CodableConceptModel(cat))
    }
    this.has_category = Array.isArray(this.category);
    this.has_udi = _.has(fhirResource, 'udi');
    this.udi = _.get(fhirResource, 'udi');
    this.addresses = _.get(fhirResource, 'addresses');
    this.has_addresses = Array.isArray(this.addresses);
    this.author = _.get(fhirResource, 'author');
    this.priority = _.get(fhirResource, 'priority.coding[0]');
    this.subject = _.get(fhirResource, 'subject');
    this.status_date = _.get(fhirResource, 'statusDate');
  };
  dstu2DTO(fhirResource:any){
    this.description = _.get(fhirResource, 'description');
  };
  stu3DTO(fhirResource:any){
    this.description = _.get(fhirResource, 'description.text', null);
    this.title = _.get(fhirResource, 'statusReason');
    this.outcome_reference = _.get(fhirResource, 'outcomeReference');
  };
  r4DTO(fhirResource:any){
    this.description = _.get(fhirResource, 'description.text', null);
    this.status = _.get(fhirResource, 'lifecycleStatus', '');
    this.has_status = _.has(fhirResource, 'lifecycleStatus');
    this.achievement_status = _.get(fhirResource, 'achievementStatus.coding[0]');
  };

  resourceDTO(fhirResource: any, fhirVersion:fhirVersions){
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
