import {fhirVersions, ResourceType} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';

interface referenceRangeHash {
  low: number | null,
  high: number | null
}

export class ObservationModel extends FastenDisplayModel {
  code: CodableConceptModel | undefined
  effective_date: string
  code_coding_display: string
  code_text: string
  value_quantity_value: number
  value_quantity_unit: string
  status: string
  value_codeable_concept_text: string
  value_codeable_concept_coding_display: string
  value_codeable_concept_coding: string
  value_quantity_value_number: number
  subject: ReferenceModel | undefined
  fhirResource: any
  reference_range: referenceRangeHash

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.fhirResource = fhirResource
    this.source_resource_type = ResourceType.Observation
    this.effective_date = _.get(fhirResource, 'effectiveDateTime');
    this.code = _.get(fhirResource, 'code');
    this.code_coding_display = _.get(fhirResource, 'code.coding.0.display');
    this.code_text = _.get(fhirResource, 'code.text', '');
    this.value_quantity_value = this.parseValue();
    this.value_quantity_unit = this.parseUnit();
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

    this.reference_range = this.parseReferenceRange();
    this.subject = _.get(fhirResource, 'subject');
  }

  private parseValue(): number {
    // TODO: parseFloat would return NaN if it can't parse. Need to check and make sure that doesn't cause issues
    return this.valueQuantity() || parseFloat(this.valueString())
  }

  private parseUnit(): string {
    return this.valueUnit() || this.valueStringUnit()
  }

  // Look for the observation's numeric value. Use this first before valueString which is a backup if this can't be found.
  private valueQuantity(): number {
    // debugger
    return _.get(this.fhirResource, "valueQuantity.value");
  }

  // Look for the observation's numeric value. Use this first before valueStringUnit which is a backup if this can't be found.
  private valueUnit(): string {
    return _.get(this.fhirResource, "valueQuantity.unit");
  }

  // Use if valueQuantity can't be found. This will check for valueString and attempt to parse the first number in the string
  private valueString(): string {
    return _.get(this.fhirResource, "valueString")?.match(/(?<value>[\d.]*)(?<text>.*)/).groups.value;
  }

  // Use if valueUnit can't be found.
  private valueStringUnit(): string {
    return _.get(this.fhirResource, "valueString")?.match(/(?<value>[\d.]*)(?<text>.*)/).groups.text;
  }

  private referenceRangeFromString(str: string): referenceRangeHash {
    let matches = str?.match(/(?<value1>[\d.]*)?(?<operator>[^\d]*)?(?<value2>[\d.]*)?/)

    if(!matches) {
      return { low: null, high: null }
    }

    if (!!matches.groups['value1'] && !!matches.groups['value2']) {
      return {
        low: parseFloat(matches.groups['value1']),
        high: parseFloat(matches.groups['value2'])
      }
    }

    if (['<', '<='].includes(matches.groups['operator'])) {
      return {
        low: null,
        high: parseFloat(matches.groups['value2'])
      }
    } else { // > >=
      return {
        low: parseFloat(matches.groups['value2']),
        high: null
      }
    }
  }

  private parseReferenceRange(): referenceRangeHash {
    let refRangeObject = _.get(this.fhirResource, "referenceRange.0")

    if (refRangeObject?.low || refRangeObject?.high) {
      return {
        low: refRangeObject.low?.value,
        high: refRangeObject.high?.value
      }
    }

    return this.referenceRangeFromString(refRangeObject?.text)
  }

  public referenceRangeDisplay(): string {
    // If text was sent just show it since we aren't storing difference between <= and <.
    // Likely doesn't really matter, but might as well if we have that data.
    if (_.get(this.fhirResource, 'referenceRange.0.text')) {
      return _.get(this.fhirResource, 'referenceRange.0.text');
    }

    let refRange = this.parseReferenceRange()

    if (refRange['low'] && refRange['high']) {
      return `${refRange['low']}\u{2013}${refRange['high']}`;
    } else if (refRange['low']) {
      return `> ${refRange['low']}`;
    } else if (refRange['high']) {
      return `< ${refRange['high']}`;
    }

    return '';
  }
}
