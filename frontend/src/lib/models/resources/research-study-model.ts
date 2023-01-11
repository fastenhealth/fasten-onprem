import {fhirVersions, ResourceType} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';

export class ResearchStudyModel extends FastenDisplayModel {

  title:string|undefined
  status:string|undefined
  category_coding:string|undefined
  focus_coding:string|undefined
  protocol_reference:string|undefined
  part_of_reference:string|undefined
  contacts:string|undefined
  keyword_concepts:string|undefined
  period:string|undefined
  enrollment_references:string|undefined
  sponsor_reference:string|undefined
  principal_investigator_reference:string|undefined
  site_references:string|undefined
  comments:string|undefined
  description:string|undefined
  arms:string|undefined
  location:string|undefined
  primary_purpose_type:string|undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.source_resource_type = ResourceType.ResearchStudy

    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }


  commonDTO(fhirResource:any) {
    this.title = _.get(fhirResource, 'title', 'Research Study');
    this.status = _.get(fhirResource, 'status');
    this.category_coding = _.get(fhirResource, 'category[0].coding[0]');
    this.focus_coding = _.get(fhirResource, 'focus[0].coding[0]');
    this.protocol_reference = _.get(fhirResource, 'protocol');
    this.part_of_reference = _.get(fhirResource, 'partOf');
    this.contacts = _.get(fhirResource, 'contact', []).map((contact: any) => {
      const name = _.get(contact, 'name');
      const telecoms = _.get(contact, 'telecom');
      return { name, telecoms };
    });
    this.keyword_concepts = _.get(fhirResource, 'keyword', []);
    this.period = _.get(fhirResource, 'period', {});
    this.enrollment_references = _.get(fhirResource, 'enrollment', []);
    this.sponsor_reference = _.get(fhirResource, 'sponsor');
    this.principal_investigator_reference = _.get(
      fhirResource,
      'principalInvestigator',
    );
    this.site_references = _.get(fhirResource, 'site', []);
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
    this.primary_purpose_type = _.get(fhirResource, 'primaryPurposeType');

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
