import {fhirVersions} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';

export class DocumentReferenceModel {
  description: string | undefined
  status: string | undefined
  docStatus: string | undefined
  typeCoding: CodingModel | undefined
  classCoding: CodingModel | undefined
  createdAt: string | undefined
  securityLabelCoding: CodingModel | undefined
  content: {
    url: string
    isUrlBinaryResourceReference: boolean
    size: string
    formatCoding: CodingModel
  } | undefined
  context: {
    eventCoding: CodingModel
    facilityTypeCoding: CodingModel
    practiceSettingCoding: CodingModel
    periodStart: string
    periodEnd: string
  } | undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions) {
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }


  commonDTO(fhirResource:any){
    this.description = _.get(fhirResource, 'description');
    this.status = _.get(fhirResource, 'status');
    this.typeCoding = _.get(fhirResource, 'type.coding[0]');
    this.classCoding = _.get(fhirResource, 'class.coding[0]');
    this.createdAt = _.get(fhirResource, 'created');
    this.securityLabelCoding = _.get(fhirResource, 'securityLabel[0].coding[0]');
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
    this.docStatus =
      _.get(fhirResource, 'docStatus.coding[0].display') ||
      _.get(fhirResource, 'docStatus.coding[0].code');
  };

  stu3DTO(fhirResource:any){
    this.docStatus = _.get(fhirResource, 'docStatus');
  };

  r4DTO(fhirResource:any){
    this.classCoding = _.get(fhirResource, 'category.coding[0]');
    this.createdAt = _.get(fhirResource, 'date');
  };

  contentDTO(fhirResource: any, fhirVersion: fhirVersions){
    this.content = _.get(fhirResource, 'content', []).map((item:any) => {
      const attachmentUrl = _.get(item, 'attachment.url');
      let url = attachmentUrl;
      let isUrlBinaryResourceReference = false;

      // Check if URL ends with "/Binary/someId". If so, swap the url for this reference, and change the flag to render different component.
      // For now raw link to the resource won't open properly, so it's better to show more valuable info for the user.
      const regex = /\/(Binary\/[\w-]+$)/gm;
      // @ts-ignore
      const matches = Array.from(attachmentUrl.matchAll(regex), m => m[1]);
      if (matches.length > 0) {
        url = matches[0];
        isUrlBinaryResourceReference = true;
      }

      const size = _.get(item, 'attachment.size');

      let formatCoding = null;
      switch (fhirVersion) {
        case fhirVersions.DSTU2: {
          formatCoding = _.get(item, 'format[0]');
          break;
        }
        case fhirVersions.STU3: {
          formatCoding = _.get(item, 'format');
          break;
        }
        case fhirVersions.R4: {
          formatCoding = _.get(item, 'format');
          break;
        }
        default:
          throw Error('Unrecognized the fhir version property type.');
      }

      return {
        url,
        isUrlBinaryResourceReference,
        size,
        formatCoding,
      };
    })
  };

  resourceDTO(fhirResource:any, fhirVersion: fhirVersions){
    switch (fhirVersion) {
      case fhirVersions.DSTU2: {
        this.commonDTO(fhirResource)
        this.contentDTO(fhirVersion, fhirResource)
        this.dstu2DTO(fhirResource)
        return
      }
      case fhirVersions.STU3: {
        this.commonDTO(fhirResource)
        this.contentDTO(fhirVersion, fhirResource)
        this.stu3DTO(fhirResource)
        return
      }
      case fhirVersions.R4: {
        this.commonDTO(fhirResource)
        this.contentDTO(fhirVersion, fhirResource)
        this.r4DTO(fhirResource)
        return
      }
      default: {
        throw Error('Unrecognized the fhir version property type.');
      }
    }
  };


}
