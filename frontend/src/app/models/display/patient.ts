import {
  getPatientAge,
  getPatientEmail,
  getPatientHomeAddress,
  getPatientImageUri,
  getPatientMRN,
  getPatientName,
  getPatientPhone
} from '../../fhir/utils';

export class Patient {
  //fields
  source_type: string
  patient_id: string

  age: string
  name: string
  phone: string
  email: string
  homeAddress: string
  deceasedBoolean: boolean
  deceasedDateTime: Date
  gender: string
  birthDate: Date
  patientImageUri: string
  mrn: string

  //this is a fhir patient resource
  constructor(fhirPatientResource: any) {
    this.age = getPatientAge(fhirPatientResource)
    this.name = getPatientName(fhirPatientResource)
    this.phone = getPatientPhone(fhirPatientResource)
    this.email = getPatientEmail(fhirPatientResource)
    this.homeAddress = getPatientHomeAddress(fhirPatientResource)
    this.deceasedBoolean = fhirPatientResource.deceasedBoolean
    this.deceasedDateTime = fhirPatientResource.deceasedDateTime
    this.gender = fhirPatientResource.gender
    this.birthDate = fhirPatientResource.birthDate
    this.patientImageUri = getPatientImageUri(fhirPatientResource)
    this.mrn = getPatientMRN(fhirPatientResource)
  }
}
