import {fhirVersions, ResourceType} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';


export class ObservationModel extends FastenDisplayModel {

  effective_date: string
  code_coding_display: string
  code_text: string
  value_quantity_value: string
  value_quantity_unit: string
  status: string
  value_codeable_concept_text: string
  value_codeable_concept_coding_display: string
  value_codeable_concept_coding: string
  value_quantity_value_number: string
  subject: string

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.source_resource_type = ResourceType.Observation
    this.effective_date = _.get(fhirResource, 'effectiveDateTime');
    this.code_coding_display = _.get(fhirResource, 'code.coding.0.display');
    this.code_text = _.get(fhirResource, 'code.text', '');
    this.value_quantity_value = _.get(fhirResource, 'valueQuantity.value', '');
    // const issued = _.get(fhirResource, 'issued', '');
    this.value_quantity_unit = _.get(fhirResource, 'valueQuantity.unit', '');
    this.status = _.get(fhirResource, 'status', '');
    this.value_codeable_concept_text = _.get(
      fhirResource,
      'valueCodeableConcept.text',
    );
    this.value_codeable_concept_coding_display = _.get(
      fhirResource,
      'valueCodeableConcept.coding[0].display',
    );
    this.value_codeable_concept_coding = _.get(
      fhirResource,
      'valueCodeableConcept.coding',
      [],
    );

    this.value_quantity_value_number = this.value_quantity_value;

    this.subject = _.get(fhirResource, 'subject');
  }
}
