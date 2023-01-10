import {fhirVersions, ResourceType} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';

export class ConditionModel extends FastenDisplayModel {

  code_text: string | undefined
  severity_text: string | undefined
  has_asserter: boolean | undefined
  asserter: ReferenceModel | undefined
  has_body_site: boolean | undefined
  body_site: CodableConceptModel[] | undefined
  clinical_status: string | undefined
  date_recorded: string | undefined
  onset_datetime: string | undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.source_resource_type = ResourceType.Condition
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }


  commonDTO(fhirResource:any){
    this.code_text =
      _.get(fhirResource, 'code.coding.0.display') ||
      _.get(fhirResource, 'code.text') ||
      _.get(fhirResource, 'code.coding.0.code');
    this.severity_text =
      _.get(fhirResource, 'severity.coding.0.display') ||
      _.get(fhirResource, 'severity.text');
    this.onset_datetime = _.get(fhirResource, 'onsetDateTime');
    this.has_asserter = _.has(fhirResource, 'asserter');
    this.asserter = _.get(fhirResource, 'asserter');
    this.has_body_site = !!_.get(fhirResource, 'bodySite.0.coding.0.display');
    let bodySite = _.get(fhirResource, 'bodySite')
    if(bodySite){
      this.body_site = bodySite.map((body:any) => new CodableConceptModel(body))
    }
  };
  dstu2DTO(fhirResource:any){
    this.clinical_status = _.get(fhirResource, 'clinicalStatus');
    this.date_recorded = _.get(fhirResource, 'dateRecorded');
  };

  stu3DTO(fhirResource:any){
    this.clinical_status = _.get(fhirResource, 'clinicalStatus');
    this.date_recorded = _.get(fhirResource, 'assertedDate');
  };

  r4DTO(fhirResource:any){
    this.clinical_status = _.get(fhirResource, 'clinicalStatus.coding.0.code');
    this.date_recorded = _.get(fhirResource, 'recordedDate');
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
