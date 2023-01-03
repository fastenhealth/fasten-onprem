import {fhirVersions} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';

export class PatientModel {
  id: string|undefined
  patientName: string|undefined
  patientBirthDate: string|undefined
  patientGender: string|undefined
  patientContact: string|undefined
  patientAddress: string|undefined
  patientPhones: string|undefined
  communicationLanguage: string|undefined
  hasCommunicationLanguage: boolean|undefined
  hasPatientPhones: boolean|undefined
  active: string|undefined
  activeStatus: string|undefined
  isDeceased: boolean|undefined
  deceasedDate: string|undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions) {
    this.id = this.getId(fhirResource);
    this.patientName = this.getNames(fhirResource);
    this.patientBirthDate = this.getBirthDate(fhirResource);
    this.patientGender = this.getGender(fhirResource);
    this.patientContact = _.get(fhirResource, 'contact[0]');
    this.patientAddress = _.get(fhirResource, 'address[0]');
    this.patientPhones = _.get(fhirResource, 'telecom', []).filter(
        (telecom: any) => telecom.system === 'phone',
    );
    let communicationLanguage = _.get(fhirResource, 'communication', [])
      .filter((item: any) => Boolean(_.get(item, 'language.coding', null)))
      .map((item: any) => item.language.coding);
    this.communicationLanguage = _.get(communicationLanguage, '0', []);
    this.hasCommunicationLanguage = !_.isEmpty(communicationLanguage);
    this.hasPatientPhones = !_.isEmpty(this.patientPhones);
    this.active = _.get(fhirResource, 'active', false);
    this.activeStatus = this.active ? 'active' : 'inactive';
    let deceasedBoolean = _.get(fhirResource, 'deceasedBoolean', false);
    this.deceasedDate = _.get(fhirResource, 'deceasedDateTime');
    this.isDeceased = deceasedBoolean || this.deceasedDate;

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
