import {CodingModel} from '../datatypes/coding-model';
import * as _ from "lodash";
import {fhirVersions, ResourceType} from '../constants'
import {ReferenceModel} from '../datatypes/reference-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';

export class AllergyIntoleranceModel extends FastenDisplayModel {

  title: string | undefined
  status: string | undefined
  recordedDate: string | undefined
  substanceCoding: CodingModel[] | undefined
  // reaction: string | undefined
  asserter: ReferenceModel | undefined
  note: { text: string }[] | undefined
  type: string | undefined
  category: string[] | undefined
  patient: ReferenceModel | undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.resourceType = ResourceType.AllergyIntolerance
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }


  commonDTO(fhirResource: any) {
    // this.reaction = _.get(fhirResource, 'reaction', []);
    this.asserter = _.get(fhirResource, 'asserter');
    this.type = _.get(fhirResource, 'type');
    this.category = _.get(fhirResource, 'category');
    this.patient = _.get(fhirResource, 'patient');
  };

  dstu2DTO(fhirResource: any) {
    this.title =
      _.get(fhirResource, 'substance.coding[0].display') ||
      _.get(fhirResource, 'substance.text', '');
    this.status = _.get(fhirResource, 'status', '');
    this.recordedDate = _.get(fhirResource, 'recordedDate');
    this.substanceCoding = _.get(fhirResource, 'substance.coding', []);
    this.asserter = _.get(fhirResource, 'reporter');
    this.note = []
    this.category = _.get(fhirResource, 'category') ? [_.get(fhirResource, 'category')] : [];
    let patientRef = _.get(fhirResource, 'patient.reference')
    if(patientRef){
      this.patient = {"reference": patientRef};
    }
  };

  stu3DTO(fhirResource: any) {
    this.title = _.get(fhirResource, 'code.coding.0.display');
    this.status = _.get(fhirResource, 'verificationStatus');
    this.recordedDate = _.get(fhirResource, 'assertedDate');
    let substanceCoding = _.get(fhirResource, 'reaction', []).filter((item: any) =>
      _.get(item, 'substance.coding'),
    );
    this.substanceCoding = _.get(substanceCoding, '0.substance.coding', []);

    this.note = _.get(fhirResource, 'note');
  };

  r4DTO(fhirResource: any) {
    this.title = _.get(fhirResource, 'code.coding.0.display');
    this.status = _.get(fhirResource, 'verificationStatus.coding[0].display');
    this.recordedDate = _.get(fhirResource, 'recordedDate');
    let substanceCoding = _.get(fhirResource, 'reaction', []).filter((item: any) =>
      _.get(item, 'substance.coding'),
    );
    this.substanceCoding = _.get(substanceCoding, '0.substance.coding', []);

    this.note = _.get(fhirResource, 'note');
  };

  resourceDTO(fhirResource: any, fhirVersion: fhirVersions) {
    switch (fhirVersion) {
      case fhirVersions.DSTU2: {
        this.commonDTO(fhirResource)
        this.dstu2DTO(fhirResource)
        return
      }
      case fhirVersions.STU3: {
        this.commonDTO(fhirResource)
        this.stu3DTO(fhirResource)
        return
      }
      case fhirVersions.R4: {
        this.commonDTO(fhirResource)
        this.r4DTO(fhirResource)
        return
      }

      default:
        throw Error('Unrecognized the fhir version property type.');
    }
  };
}



