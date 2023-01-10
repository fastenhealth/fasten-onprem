import {fhirVersions} from '../constants';
import * as _ from "lodash";
import {ReferenceModel} from '../datatypes/reference-model';
import {CodableConceptModel} from '../datatypes/codable-concept-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';

export class CareTeamModel extends FastenDisplayModel {

  name: string | undefined
  status: string | undefined
  periodStart: string | undefined
  periodEnd: string | undefined
  participants: any[] | undefined
  category: CodableConceptModel[] | undefined
  subject: ReferenceModel | undefined
  encounter: ReferenceModel | undefined
  managingOrganization: ReferenceModel | undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4)
  }

  commonDTO(fhirResource: any){
    // Default value for title - "Care team"
    this.name = _.get(fhirResource, 'name', 'Care team');
    this.status = _.get(fhirResource, 'status');
    this.periodStart = _.get(fhirResource, 'period.start');
    this.periodEnd = _.get(fhirResource, 'period.end');
    this.category = _.get(fhirResource, 'category');
    this.subject = _.get(fhirResource, 'subject');
    this.managingOrganization =
      _.get(fhirResource, 'managingOrganization[0]') ||
      _.get(fhirResource, 'managingOrganization');

    this.participants = _.get(fhirResource, 'participant', []).map((item: any) => {
      const display = _.get(item, 'member.display');
      const role = _.get(item, 'role.text') || _.get(item, 'role.coding.0.display');
      const periodStart = _.get(item, 'period.start');
      const periodEnd = _.get(item, 'period.end');

      return {
        display,
        role,
        periodStart,
        periodEnd,
      };
    });
  };

  r4DTO(fhirResource: any){
    this.encounter = _.get(fhirResource, 'encounter');
  };

  resourceDTO(fhirResource: any, fhirVersion: any){
    switch (fhirVersion) {
      // Component doesn't exist in DSTU2
      case fhirVersions.STU3: {
        this.commonDTO(fhirResource)
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
