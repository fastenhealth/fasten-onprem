import {fhirVersions} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';

export class GoalModel {

  title: string | undefined
  status: string | undefined
  hasStatus: boolean | undefined
  startDate: string | undefined
  hasCategory: boolean | undefined
  category: CodableConceptModel[] | undefined
  hasUdi: boolean | undefined
  udi: string | undefined
  addresses: any[] | undefined
  hasAddresses: boolean | undefined
  author: string | undefined
  description: string | undefined
  outcomeReference: string | undefined
  achievementStatus: CodingModel | undefined
  priority: CodingModel | undefined
  subject: ReferenceModel | undefined
  statusDate: string | undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions) {
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }

  commonDTO(fhirResource: any){
    this.title = _.get(fhirResource, 'note[0].text', 'Goal');
    this.status = _.get(fhirResource, 'status', '');
    this.hasStatus = _.has(fhirResource, 'status');
    this.startDate = _.get(fhirResource, 'startDate');
    let category = _.get(fhirResource, 'category');
    if(category){
      this.category = category.map((cat:any) => new CodableConceptModel(cat))
    }
    this.hasCategory = Array.isArray(this.category);
    this.hasUdi = _.has(fhirResource, 'udi');
    this.udi = _.get(fhirResource, 'udi');
    this.addresses = _.get(fhirResource, 'addresses');
    this.hasAddresses = Array.isArray(this.addresses);
    this.author = _.get(fhirResource, 'author');
    this.priority = _.get(fhirResource, 'priority.coding[0]');
    this.subject = _.get(fhirResource, 'subject');
    this.statusDate = _.get(fhirResource, 'statusDate');
  };
  dstu2DTO(fhirResource:any){
    this.description = _.get(fhirResource, 'description');
  };
  stu3DTO(fhirResource:any){
    this.description = _.get(fhirResource, 'description.text', null);
    this.title = _.get(fhirResource, 'statusReason');
    this.outcomeReference = _.get(fhirResource, 'outcomeReference');
  };
  r4DTO(fhirResource:any){
    this.description = _.get(fhirResource, 'description.text', null);
    this.status = _.get(fhirResource, 'lifecycleStatus', '');
    this.hasStatus = _.has(fhirResource, 'lifecycleStatus');
    this.achievementStatus = _.get(fhirResource, 'achievementStatus.coding[0]');
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
