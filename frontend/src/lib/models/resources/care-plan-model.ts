import {fhirVersions} from '../constants';
import * as _ from "lodash";
import {ReferenceModel} from '../datatypes/reference-model';

export class CarePlanModel {

  status: string | undefined
  expiry: string | undefined
  category: any[] | undefined
  hasCategory: boolean | undefined
  goals: ReferenceModel[] | undefined
  hasGoals: boolean | undefined
  addresses: ReferenceModel[] | undefined
  hasAddresses: boolean | undefined
  activity: any
  hasActivity: boolean | undefined
  basedOn: string | undefined
  partOf: string | undefined
  intent: string | undefined
  description: string | undefined
  subject: ReferenceModel | undefined
  periodStart: string | undefined
  periodEnd: string | undefined
  author: ReferenceModel | undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions) {
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }

  commonDTO(fhirResource: any) {
    this.status = _.get(fhirResource, 'status', '');
    this.expiry = _.get(fhirResource, 'expiry');
    this.category = _.get(fhirResource, 'category');
    this.hasCategory = Array.isArray(_.get(fhirResource, 'category.0.coding'));
    this.goals = _.get(fhirResource, 'goal');
    this.hasGoals = Array.isArray(this.goals);
    this.addresses = _.get(fhirResource, 'addresses')
    this.hasAddresses = Array.isArray(this.addresses);
    this.description = _.get(fhirResource, 'description');
    this.subject = _.get(fhirResource, 'subject');
    this.periodStart = _.get(fhirResource, 'period.start');
    this.periodEnd = _.get(fhirResource, 'period.end');
    this.author = _.get(fhirResource, 'author');
  };

  dstu2DTO(fhirResource: any){
    this.activity = _.get(fhirResource, 'activity');
    this.hasActivity = Array.isArray(this.activity);
    this.activity = !this.hasActivity
      ? this.activity
      : this.activity.map((item: any) => {
        const categories = _.get(item, 'detail.category.coding');
        return {
          title:
            _.get(item, 'detail.code.text') ||
            _.get(item, 'detail.code.coding[0].code'),
          hasCategories: Array.isArray(categories),
          categories,
        };
      });
  };

  stu3DTO(fhirResource: any) {
    let activity = _.get(fhirResource, 'activity');
    this.hasActivity = Array.isArray(activity);
    this.activity = !this.hasActivity
      ? activity
      : activity.map((item: any) => {
        const categories = [
          ..._.get(item, 'detail.category.coding', []),
          ..._.get(item, 'detail.code.coding', []),
        ];
        return {
          title:
            _.get(item, 'detail.code.text') ||
            _.get(item, 'detail.code.coding[0].code'),
          hasCategories: Array.isArray(categories) && categories.length > 0,
          categories,
        };
      });
    this.basedOn = _.get(fhirResource, 'basedOn', []);
    this.partOf = _.get(fhirResource, 'partOf', []);
    this.intent = _.get(fhirResource, 'intent', []);
  };

  r4DTO(fhirResource: any) {
    this.activity = _.get(fhirResource, 'activity');
    this.hasActivity = Array.isArray(this.activity);
    this.activity = !this.hasActivity
      ? this.activity
      : this.activity.map((item: any) => {
        const categories = [
          ..._.get(item, 'detail.category.coding', []),
          ..._.get(item, 'detail.code.coding', []),
        ];
        return {
          title:
            _.get(item, 'detail.code.text') ||
            _.get(item, 'detail.code.coding[0].code'),
          hasCategories: Array.isArray(categories) && categories.length > 0,
          categories,
        };
      });
  }
  resourceDTO(fhirResource: any, fhirVersion: fhirVersions){
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
  }
}
