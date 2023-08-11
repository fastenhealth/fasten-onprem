import {fhirVersions, ResourceType} from '../constants';
import * as _ from "lodash";
import {ReferenceModel} from '../datatypes/reference-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';
import {CodableConceptModel} from '../datatypes/codable-concept-model';

export class CarePlanModel extends FastenDisplayModel {
  code: CodableConceptModel | undefined
  status: string | undefined
  expiry: string | undefined
  category: any[] | undefined
  has_category: boolean | undefined
  goals: ReferenceModel[] | undefined
  has_goals: boolean | undefined
  addresses: ReferenceModel[] | undefined
  has_addresses: boolean | undefined
  activity: any
  has_activity: boolean | undefined
  based_on: string | undefined
  part_of: string | undefined
  intent: string | undefined
  description: string | undefined
  subject: ReferenceModel | undefined
  period_start: string | undefined
  period_end: string | undefined
  author: ReferenceModel | undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.source_resource_type = ResourceType.CarePlan
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }

  commonDTO(fhirResource: any) {
    this.code = _.get(fhirResource, 'category');

    this.status = _.get(fhirResource, 'status', '');
    this.expiry = _.get(fhirResource, 'expiry');
    this.category = _.get(fhirResource, 'category');
    this.has_category = Array.isArray(_.get(fhirResource, 'category.0.coding'));
    this.goals = _.get(fhirResource, 'goal');
    this.has_goals = Array.isArray(this.goals);
    this.addresses = _.get(fhirResource, 'addresses')
    this.has_addresses = Array.isArray(this.addresses);
    this.description = _.get(fhirResource, 'description');
    this.subject = _.get(fhirResource, 'subject');
    this.period_start = _.get(fhirResource, 'period.start');
    this.period_end = _.get(fhirResource, 'period.end');
    this.author = _.get(fhirResource, 'author');
  };

  dstu2DTO(fhirResource: any){
    this.activity = _.get(fhirResource, 'activity');
    this.has_activity = Array.isArray(this.activity);
    this.activity = !this.has_activity
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
    this.has_activity = Array.isArray(activity);
    this.activity = !this.has_activity
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
    this.based_on = _.get(fhirResource, 'basedOn', []);
    this.part_of = _.get(fhirResource, 'partOf', []);
    this.intent = _.get(fhirResource, 'intent', []);
  };

  r4DTO(fhirResource: any) {
    this.activity = _.get(fhirResource, 'activity');
    this.has_activity = Array.isArray(this.activity);
    this.activity = !this.has_activity
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
