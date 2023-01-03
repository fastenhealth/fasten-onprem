import {fhirVersions} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';


export class ObservationModel {

  effectiveDate: string
  codeCodingDisplay: string
  codeText: string
  valueQuantityValue: string
  valueQuantityUnit: string
  status: string
  valueCodeableConceptText: string
  valueCodeableConceptCodingDisplay: string
  valueCodeableConceptCoding: string
  valueQuantityValueNumber: string
  subject: string

  constructor(fhirResource: any, fhirVersion?: fhirVersions) {
    this.effectiveDate = _.get(fhirResource, 'effectiveDateTime');
    this.codeCodingDisplay = _.get(fhirResource, 'code.coding.0.display');
    this.codeText = _.get(fhirResource, 'code.text', '');
    this.valueQuantityValue = _.get(fhirResource, 'valueQuantity.value', '');
    // const issued = _.get(fhirResource, 'issued', '');
    this.valueQuantityUnit = _.get(fhirResource, 'valueQuantity.unit', '');
    this.status = _.get(fhirResource, 'status', '');
    this.valueCodeableConceptText = _.get(
      fhirResource,
      'valueCodeableConcept.text',
    );
    this.valueCodeableConceptCodingDisplay = _.get(
      fhirResource,
      'valueCodeableConcept.coding[0].display',
    );
    this.valueCodeableConceptCoding = _.get(
      fhirResource,
      'valueCodeableConcept.coding',
      [],
    );

    this.valueQuantityValueNumber = this.valueQuantityValue;

    this.subject = _.get(fhirResource, 'subject');
  }
}
