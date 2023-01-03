import {fhirVersions} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';

export class ConditionModel {
  codeText: string | undefined
  severityText: string | undefined
  hasAsserter: boolean | undefined
  asserter: ReferenceModel | undefined
  hasBodySite: boolean | undefined
  bodySite: CodableConceptModel[] | undefined
  clinicalStatus: string | undefined
  dateRecorded: string | undefined
  onsetDateTime: string | undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions) {
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }


  commonDTO(fhirResource:any){
    this.codeText =
      _.get(fhirResource, 'code.coding.0.display') ||
      _.get(fhirResource, 'code.text') ||
      _.get(fhirResource, 'code.coding.0.code');
    this.severityText =
      _.get(fhirResource, 'severity.coding.0.display') ||
      _.get(fhirResource, 'severity.text');
    this.onsetDateTime = _.get(fhirResource, 'onsetDateTime');
    this.hasAsserter = _.has(fhirResource, 'asserter');
    this.asserter = _.get(fhirResource, 'asserter');
    this.hasBodySite = !!_.get(fhirResource, 'bodySite.0.coding.0.display');
    let bodySite = _.get(fhirResource, 'bodySite')
    if(bodySite){
      this.bodySite = bodySite.map((body:any) => new CodableConceptModel(body))
    }
  };
  dstu2DTO(fhirResource:any){
    this.clinicalStatus = _.get(fhirResource, 'clinicalStatus');
    this.dateRecorded = _.get(fhirResource, 'dateRecorded');
  };

  stu3DTO(fhirResource:any){
    this.clinicalStatus = _.get(fhirResource, 'clinicalStatus');
    this.dateRecorded = _.get(fhirResource, 'assertedDate');
  };

  r4DTO(fhirResource:any){
    this.clinicalStatus = _.get(fhirResource, 'clinicalStatus.coding.0.code');
    this.dateRecorded = _.get(fhirResource, 'recordedDate');
  };

  resourceDTO(fhirResource:any, fhirVersion:fhirVersions){
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
