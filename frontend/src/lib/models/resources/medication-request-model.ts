import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {CodingModel} from '../datatypes/coding-model';
import {fhirVersions, ResourceType} from '../constants';
import {FastenOptions} from '../fasten/fasten-options';
import * as _ from "lodash";
import {ReferenceModel} from '../datatypes/reference-model';

export class MedicationRequestModel extends FastenDisplayModel {

  display: string|undefined
  medication_reference: ReferenceModel|undefined
  medication_codeable_concept: CodingModel|undefined
  reason_code: string|undefined
  dosage_instruction: string|undefined
  has_dosage_instruction: boolean|undefined
  requester: ReferenceModel|undefined
  created: string|undefined
  intent: string|undefined
  status: string|undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.source_resource_type = ResourceType.MedicationRequest

    this.medication_reference = _.get(fhirResource, 'medicationReference');
    this.medication_codeable_concept = _.get(
      fhirResource,
      'medicationCodeableConcept.coding.0',
    );
    this.reason_code = _.get(fhirResource, 'reasonCode');
    this.status = _.get(fhirResource, 'status');
    this.dosage_instruction = _.get(fhirResource, 'dosageInstruction');
    this.has_dosage_instruction =
      Array.isArray(this.dosage_instruction) && this.dosage_instruction.length > 0;
    this.requester =
      _.get(fhirResource, 'requester.agent') || _.get(fhirResource, 'requester');
    this.created = _.get(fhirResource, 'authoredOn');
    this.intent = _.get(fhirResource, 'intent');

    this.display = _.get(fhirResource, 'medicationCodeableConcept.text') || this.medication_codeable_concept?.display || _.get(fhirResource, 'medicationCodeableConcept.text') || this.medication_reference?.display
  }
}
