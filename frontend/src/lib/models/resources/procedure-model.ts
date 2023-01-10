import {fhirVersions} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';

export class ProcedureModel extends FastenDisplayModel {

  display: string|undefined;
  status: string|undefined;
  hasPerformedDateTime: boolean|undefined;
  performedDateTime: string|undefined;
  performedPeriodStart: string|undefined;
  performedPeriodEnd: string|undefined;
  hasPerformedPeriod: boolean|undefined;
  hasCoding: boolean|undefined;
  coding: string|undefined;
  category: string|undefined;
  locationReference: string|undefined;
  hasPerformerData: boolean|undefined;
  performer: string|undefined;
  hasReasonCode: boolean|undefined;
  reasonCode: string|undefined;
  hasNote: boolean|undefined;
  note: string|undefined;
  outcome: string|undefined;

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.display =
      _.get(fhirResource, 'code.coding[0].display') ||
      _.get(fhirResource, 'code.text');
    this.status = _.get(fhirResource, 'status', '');
    this.hasPerformedDateTime = _.has(fhirResource, 'performedDateTime');
    this.performedDateTime = _.get(fhirResource, 'performedDateTime');
    this.performedPeriodStart = _.get(fhirResource, 'performedPeriod.start');
    this.performedPeriodEnd = _.get(fhirResource, 'performedPeriod.end');
    this.hasPerformedPeriod = !!(this.performedPeriodStart || this.performedPeriodEnd);
    this.hasCoding = _.has(fhirResource, 'code.coding');
    this.coding = _.get(fhirResource, 'code.coding', []);
    this.category = _.get(fhirResource, 'category.coding[0]');
    this.locationReference = _.get(fhirResource, 'location');
    this.hasPerformerData = _.has(fhirResource, 'performer.0.actor.display');
    this.performer = _.get(fhirResource, 'performer', []);
    this.hasReasonCode = _.has(fhirResource, 'reasonCode');
    this.reasonCode = _.get(fhirResource, 'reasonCode', []);
    this.hasNote = _.has(fhirResource, 'note');
    this.note = _.get(fhirResource, 'note', []);
    this.outcome = _.get(fhirResource, 'outcome');

  }

}
