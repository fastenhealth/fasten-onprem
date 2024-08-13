import { PatientModel } from './patient-model';

describe('PatientModel', () => {
  let patientModel: PatientModel;
  let mockFhirResource: any;

  beforeEach(() => {
    mockFhirResource = {
      id: '123',
      name: [{ given: ['John'], family: 'Doe' }],
      birthDate: '1990-01-01',
      gender: 'male',
      telecom: [
        { system: 'phone', value: '123-456-7890', use: 'home' },
        { system: 'email', value: 'john@example.com', use: 'work' }
      ],
      communication: [
        { language: { coding: [{ system: 'urn:ietf:bcp:47', code: 'en', display: 'English' }] } }
      ],
      maritalStatus: { text: 'Married' },
      extension: [
        {
          url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex',
          valueCode: 'M'
        },
        {
          url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-race',
          extension: [{ url: 'text', valueString: 'White' }]
        },
        {
          url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity',
          extension: [{ url: 'text', valueString: 'Not Hispanic or Latino' }]
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName',
          valueString: 'Smith'
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/patient-birthPlace',
          valueAddress: { city: 'New York', state: 'NY', country: 'USA' }
        }
      ],
      identifier: [
        { system: 'http://hl7.org/fhir/sid/us-ssn', value: '123-45-6789' },
        { type: { coding: [{ code: 'MR' }] }, value: 'MRN12345' },
        { type: { text: 'Driver\'s License', coding: [{ display: 'DL' }] }, system: 'urn:oid:2.16.840.1.113883.4.3.25', value: 'S99969890' }
      ]
    };
    patientModel = new PatientModel(mockFhirResource);
  });

  it('should create an instance', () => {
    expect(new PatientModel({})).toBeTruthy();
  });

  it('should return the correct id', () => {
    expect(patientModel.id).toBe('123');
  });

  it('should return the formatted name', () => {
    expect(patientModel.patient_name).toBe('John Doe');
  });

  it('should return the correct birth date', () => {
    expect(patientModel.patient_birthdate).toBe('1990-01-01');
  });

  // it('should return the correct age', () => {


  //   const currentDate = new Date('2022-02-01');
  //   jasmine.clock().install();
  //   jasmine.clock().mockDate(currentDate);

  //   expect(FORMATTERS.age('1990-01-01')).toBe(32);
  //   expect(patientModel.patient_birthdate).toBe('1990-01-01');
  //   expect(patientModel.patient_age).toBe(32);
  //   jasmine.clock().uninstall();
  // });

  it('should return the correct gender', () => {
    expect(patientModel.patient_gender).toBe('male');
  });

  it('should return the correct telecom information', () => {
    expect(patientModel.patient_phones).toEqual([
      { system: 'phone', value: '123-456-7890', use: 'home' },
      { system: 'email', value: 'john@example.com', use: 'work' }
    ]);
  });

  it('should return the correct language information', () => {
    expect(patientModel.communication_languages).toEqual([
      { system: 'urn:ietf:bcp:47', code: 'en', display: 'English' }
    ]);
  });

  it('should return the correct birth sex', () => {
    expect(patientModel.birth_sex).toBe('M');
  });

  it('should return the correct marital status', () => {
    expect(patientModel.marital_status).toBe('Married');
  });

  it('should return the correct race', () => {
    expect(patientModel.race).toBe('White');
  });

  it('should return the correct ethnicity', () => {
    expect(patientModel.ethnicity).toBe('Not Hispanic or Latino');
  });

  it('should return the correct mother\'s maiden name', () => {
    expect(patientModel.mothers_maiden_name).toBe('Smith');
  });

  it('should return the correct birth place', () => {
    expect(patientModel.birth_place).toBe('New York, NY, USA');
  });

  it('should correctly parse other identifiers', () => {
    expect(patientModel.identifiers).toEqual([
      { type: 'Driver\'s License', system: 'urn:oid:2.16.840.1.113883.4.3.25', value: 'S99969890' }
    ]);
  });

  // it('should return the correct extensions', () => {
  //   const extensions = patientModel.getExtensions(mockFhirResource);
  //   expect(extensions).toContainEqual({ url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex', value: 'M' });
  //   expect(extensions).toContainEqual({ url: 'http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName', value: 'Smith' });
  // });

  it('should return the correct SSN', () => {
    expect(patientModel.ssn).toBe('123-45-6789');
  });

  it('should return the correct MRN', () => {
    const mockResourceWithMRN = {
      ...mockFhirResource,
      extension: [
        ...mockFhirResource.extension,
        { url: 'http://hl7.org/fhir/StructureDefinition/patient-mrn', valueString: 'MRN54321' }
      ]
    };
    expect(patientModel.getMRN(mockResourceWithMRN)).toBe('MRN54321');
  });
});
