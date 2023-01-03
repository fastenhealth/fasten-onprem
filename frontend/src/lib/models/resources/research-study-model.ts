import {fhirVersions} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';

export class ResearchStudyModel {
  title:string|undefined
  status:string|undefined
  categoryCoding:string|undefined
  focusCoding:string|undefined
  protocolReference:string|undefined
  partOfReference:string|undefined
  contacts:string|undefined
  keywordConcepts:string|undefined
  period:string|undefined
  enrollmentReferences:string|undefined
  sponsorReference:string|undefined
  principalInvestigatorReference:string|undefined
  siteReferences:string|undefined
  comments:string|undefined
  description:string|undefined
  arms:string|undefined
  location:string|undefined
  primaryPurposeType:string|undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions) {
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }


  commonDTO(fhirResource:any) {
    this.title = _.get(fhirResource, 'title', 'Research Study');
    this.status = _.get(fhirResource, 'status');
    this.categoryCoding = _.get(fhirResource, 'category[0].coding[0]');
    this.focusCoding = _.get(fhirResource, 'focus[0].coding[0]');
    this.protocolReference = _.get(fhirResource, 'protocol');
    this.partOfReference = _.get(fhirResource, 'partOf');
    this.contacts = _.get(fhirResource, 'contact', []).map((contact: any) => {
      const name = _.get(contact, 'name');
      const telecoms = _.get(contact, 'telecom');
      return { name, telecoms };
    });
    this.keywordConcepts = _.get(fhirResource, 'keyword', []);
    this.period = _.get(fhirResource, 'period', {});
    this.enrollmentReferences = _.get(fhirResource, 'enrollment', []);
    this.sponsorReference = _.get(fhirResource, 'sponsor');
    this.principalInvestigatorReference = _.get(
      fhirResource,
      'principalInvestigator',
    );
    this.siteReferences = _.get(fhirResource, 'site', []);
    this.comments = _.get(fhirResource, 'note', []);
    this.description = _.get(fhirResource, 'description');
    this.arms = _.get(fhirResource, 'arm', []).map((arm: any) => {
      const name = _.get(arm, 'name');
      const description = _.get(arm, 'description');
      const coding = _.get(arm, 'code.coding[0]');
      return { name, description, coding };
    });
  };

  r4DTO(fhirResource:any) {
    this.location = _.get(fhirResource, 'location');
    this.primaryPurposeType = _.get(fhirResource, 'primaryPurposeType');

  };

  resourceDTO(fhirResource:any, fhirVersion:fhirVersions) {
    switch (fhirVersion) {
      case fhirVersions.STU3: {
        this.commonDTO(fhirResource)
        return
      }
      case fhirVersions.R4: {
        this.commonDTO(fhirResource)
        this.r4DTO(fhirResource)
        return
      }
      default: {
        throw Error('Unrecognized the fhir version property type.');
      }
    }
  };

}
