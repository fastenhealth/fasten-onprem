import {fhirVersions, ResourceType} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';

export class DiagnosticReportModel extends FastenDisplayModel {

  title: string | undefined
  status: string | undefined
  effective_datetime: string | undefined
  category_coding: CodingModel[] | undefined
  has_category_coding: boolean | undefined
  has_performer: boolean | undefined
  conclusion: string | undefined
  performer: ReferenceModel | undefined
  issued: string | undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.source_resource_type = ResourceType.DiagnosticReport
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }

  commonDTO(fhirResource:any){
    this.title =
      _.get(fhirResource, 'code.text') ||
      _.get(fhirResource, 'code.display') ||
      _.get(fhirResource, 'code.coding.0.display', null);
    this.status = _.get(fhirResource, 'status', '');
    this.effective_datetime = _.get(fhirResource, 'effectiveDateTime');
    this.category_coding = _.get(fhirResource, 'category.coding');
    this.has_category_coding = Array.isArray(this.category_coding);
    this.conclusion = _.get(fhirResource, 'conclusion');
    this.issued = _.get(fhirResource, 'issued');
  };

  dstu2DTO(fhirResource:any){
    this.has_performer = _.has(fhirResource, 'performer');
    this.performer = _.get(fhirResource, 'performer');
  };
  stu3DTO(fhirResource:any){
    this.has_performer = _.has(fhirResource, 'performer.0.actor.display');
    this.performer = _.get(fhirResource, 'performer.0.actor');
  };

  r4DTO(fhirResource:any){
    this.performer = _.get(fhirResource, 'performer.0.actor');
    if (!this.performer) {
      this.performer = _.get(fhirResource, 'performer.0');
    }
    this.has_performer = !!this.performer;
    this.category_coding = _.get(fhirResource, 'category.coding');
    this.has_category_coding = Array.isArray(this.category_coding);
  };

  resourceDTO(fhirResource:any, fhirVersion: fhirVersions){
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
