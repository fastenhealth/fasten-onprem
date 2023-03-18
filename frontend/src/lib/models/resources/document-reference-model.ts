import {fhirVersions, ResourceType} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';
import {Attachment} from 'fhir/r4';
import {BinaryModel} from './binary-model';

export class DocumentReferenceModel extends FastenDisplayModel {

  description: string | undefined
  status: string | undefined
  category: CodableConceptModel | undefined
  doc_status: string | undefined
  type_coding: CodingModel | undefined
  class_coding: CodingModel | undefined
  created_at: string | undefined
  security_label_coding: CodingModel | undefined
  content: BinaryModel[] | undefined
  context: {
    eventCoding: CodingModel
    facilityTypeCoding: CodingModel
    practiceSettingCoding: CodingModel
    periodStart: string
    periodEnd: string
  } | undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.source_resource_type = ResourceType.DocumentReference
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }


  commonDTO(fhirResource:any){
    this.description = _.get(fhirResource, 'description');
    this.status = _.get(fhirResource, 'status');
    this.type_coding = _.get(fhirResource, 'type.coding[0]');
    this.class_coding = _.get(fhirResource, 'class.coding[0]');
    this.created_at = _.get(fhirResource, 'created');
    this.security_label_coding = _.get(fhirResource, 'securityLabel[0].coding[0]');
    const eventCoding = _.get(fhirResource, 'context.event[0].coding[0]');
    const facilityTypeCoding = _.get(
      fhirResource,
      'context.facilityType.coding[0]',
    );
    const practiceSettingCoding = _.get(
      fhirResource,
      'context.practiceSetting.coding[0]',
    );
    const periodStart = _.get(fhirResource, 'context.period.start');
    const periodEnd = _.get(fhirResource, 'context.period.end');
    this.context = {
      eventCoding,
      facilityTypeCoding,
      practiceSettingCoding,
      periodStart,
      periodEnd,
    };
  };

  dstu2DTO(fhirResource:any) {
    this.doc_status =
      _.get(fhirResource, 'docStatus.coding[0].display') ||
      _.get(fhirResource, 'docStatus.coding[0].code');
  };

  stu3DTO(fhirResource:any){
    this.doc_status = _.get(fhirResource, 'docStatus');
  };

  r4DTO(fhirResource:any){
    this.class_coding = _.get(fhirResource, 'category.coding[0]');
    this.created_at = _.get(fhirResource, 'date');
  };

  contentDTO(fhirResource: any, fhirVersion: fhirVersions){
    console.log('INSIDE CONTENTDTO', fhirResource)
    this.category = new CodableConceptModel(_.get(fhirResource, 'category[0]') || {});
    this.content = _.get(fhirResource, 'content', []).map((content: any) => {
      const attachment: Attachment = _.get(content, 'attachment');
      const binaryModel = new BinaryModel(attachment, fhirVersion);
      return binaryModel;
    })
  };

  resourceDTO(fhirResource:any, fhirVersion: fhirVersions){
    switch (fhirVersion) {
      case fhirVersions.DSTU2: {
        this.commonDTO(fhirResource)
        this.contentDTO(fhirResource,fhirVersion)
        this.dstu2DTO(fhirResource)
        return
      }
      case fhirVersions.STU3: {
        this.commonDTO(fhirResource)
        this.contentDTO(fhirResource,fhirVersion)
        this.stu3DTO(fhirResource)
        return
      }
      case fhirVersions.R4: {
        this.commonDTO(fhirResource)
        this.contentDTO(fhirResource,fhirVersion)
        this.r4DTO(fhirResource)
        return
      }
      default: {
        throw Error('Unrecognized the fhir version property type.');
      }
    }
  };


}
