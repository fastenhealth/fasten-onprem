import {fhirVersions, ResourceType} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';

export class ProcedureModel extends FastenDisplayModel {
  code: CodableConceptModel| undefined
  display: string|undefined;
  status: string|undefined;
  has_performed_datetime: boolean|undefined;
  performed_datetime: string|undefined;
  performed_period_start: string|undefined;
  performed_period_end: string|undefined;
  has_performed_period: boolean|undefined;
  has_coding: boolean|undefined;
  coding: CodingModel[]|undefined;
  category: string|undefined;
  location_reference: string|undefined;
  has_performer_data: boolean|undefined;
  performer: string|any[]|undefined;
  has_reason_code: boolean|undefined;
  reason_code: string|undefined;
  has_note: boolean|undefined;
  note: string|any[]|undefined;
  outcome: string|undefined;

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.source_resource_type = ResourceType.Procedure

    this.display =
      _.get(fhirResource, 'code.coding[0].display') ||
      _.get(fhirResource, 'code.text');
    this.status = _.get(fhirResource, 'status', '');
    this.has_performed_datetime = _.has(fhirResource, 'performedDateTime');
    this.performed_datetime = _.get(fhirResource, 'performedDateTime');
    this.performed_period_start = _.get(fhirResource, 'performedPeriod.start');
    this.performed_period_end = _.get(fhirResource, 'performedPeriod.end');
    this.has_performed_period = !!(this.performed_period_start || this.performed_period_end);
    this.has_coding = _.has(fhirResource, 'code.coding');
    this.coding = _.get(fhirResource, 'code.coding', []);
    this.code = _.get(fhirResource, 'code');
    this.category = _.get(fhirResource, 'category.coding[0]');
    this.location_reference = _.get(fhirResource, 'location');
    this.has_performer_data = _.has(fhirResource, 'performer.0.actor.display');
    this.performer = _.get(fhirResource, 'performer', []);
    this.has_reason_code = _.has(fhirResource, 'reasonCode');
    this.reason_code = _.get(fhirResource, 'reasonCode', []);
    this.has_note = _.has(fhirResource, 'note');
    this.note = _.get(fhirResource, 'note', []);
    this.outcome = _.get(fhirResource, 'outcome');

  }

}
