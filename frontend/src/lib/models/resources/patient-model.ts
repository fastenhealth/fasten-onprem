import {fhirVersions, ResourceType} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';

export class PatientModel extends FastenDisplayModel {

  id: string|undefined
  patient_name: string|undefined
  patient_birthdate: string|undefined
  patient_gender: string|undefined
  patient_contact: string|undefined
  patient_address: string|undefined
  patient_phones: string|undefined
  communication_language: string|undefined
  has_communication_language: boolean|undefined
  has_patient_phones: boolean|undefined
  active: string|undefined
  active_status: string|undefined
  is_deceased: boolean|undefined
  deceased_date: string|undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.source_resource_type = ResourceType.Patient

    this.id = this.getId(fhirResource);
    this.patient_name = this.getNames(fhirResource);
    this.patient_birthdate = this.getBirthDate(fhirResource);
    this.patient_gender = this.getGender(fhirResource);
    this.patient_contact = _.get(fhirResource, 'contact[0]');
    this.patient_address = _.get(fhirResource, 'address[0]');
    this.patient_phones = _.get(fhirResource, 'telecom', []).filter(
        (telecom: any) => telecom.system === 'phone',
    );
    let communicationLanguage = _.get(fhirResource, 'communication', [])
      .filter((item: any) => Boolean(_.get(item, 'language.coding', null)))
      .map((item: any) => item.language.coding);
    this.communication_language = _.get(communicationLanguage, '0', []);
    this.has_communication_language = !_.isEmpty(communicationLanguage);
    this.has_patient_phones = !_.isEmpty(this.patient_phones);
    this.active = _.get(fhirResource, 'active', false);
    this.active_status = this.active ? 'active' : 'inactive';
    let deceasedBoolean = _.get(fhirResource, 'deceasedBoolean', false);
    this.deceased_date = _.get(fhirResource, 'deceasedDateTime');
    this.is_deceased = deceasedBoolean || this.deceased_date;

  }
  getId(fhirResource: any) {
    return _.get(fhirResource, 'id');
  }
  getNames(fhirResource: any) {
    return _.get(fhirResource, 'name.0', null);
  }
  getBirthDate(fhirResource: any) {
    return _.get(fhirResource, 'birthDate');
  }
  getGender(fhirResource: any) {
    return _.get(fhirResource, 'gender');
  }
}
