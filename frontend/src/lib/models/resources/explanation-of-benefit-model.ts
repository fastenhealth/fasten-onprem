import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {CodableConceptModel} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {fhirVersions, ResourceType} from '../constants';
import {FastenOptions} from '../fasten/fasten-options';
import * as _ from "lodash";
import {CodingModel} from '../datatypes/coding-model';

export class ExplanationOfBenefitModel extends FastenDisplayModel {

  disposition: string | undefined
  created: string | undefined
  insurer: ReferenceModel | undefined
  totalBenefit: number | undefined
  totalCost: number | undefined
  hasInsurer: boolean | undefined
  hasType: boolean | undefined
  type: CodingModel[] | undefined
  hasServices: boolean | undefined
  services: any[] | undefined
  information: any[] | undefined
  hasInformation: boolean | undefined
  resourceStatus: string | undefined
  useCode: string | undefined
  patient: ReferenceModel | undefined
  provider: ReferenceModel | undefined
  insurance: any[] | undefined
  total: { category: CodableConceptModel, amount: any }[] | undefined
  hasTotal: boolean | undefined
  diagnosis: {
    sequence: number,
    diagnosisCodeableConcept: CodableConceptModel,
  }[] | undefined
  hasDiagnosis: boolean | undefined
  supportingInfo: any[] | undefined
  hasSupportingInfo: boolean | undefined
  items: any[] | undefined
  hasItems: boolean | undefined
  payment: any[] | undefined
  billablePeriod: { start: string, end: string }[] | undefined
  identifier: any[] | undefined
  outcome: string | undefined
  careTeam: {
    provider: ReferenceModel,
    role: {
      coding: CodingModel[]
    }
  }[] | undefined
  hasCareTeam: boolean | undefined
  payeeType: CodableConceptModel | undefined
  payeeParty: ReferenceModel | undefined
  related: any[] | undefined
  procedures: { date: string, procedureCodeableConcept: CodableConceptModel}[] | undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.source_resource_type = ResourceType.ExplanationOfBenefit
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }

  commonDTO(fhirResource){
    this.disposition = _.get(fhirResource, 'disposition');
    this.created = String(_.get(fhirResource, 'created')).slice(0, 10);
    this.insurer = _.get(fhirResource, 'insurer');
    this.hasInsurer = !!_.get(fhirResource, 'insurer.reference');
  };
  dstu2DTO(fhirResource){
    this.insurer = _.get(fhirResource, 'organization');
    this.hasInsurer = !!_.get(fhirResource, 'organization.reference');
  };

  stu3DTO(fhirResource){
    this.totalBenefit = _.get(fhirResource, 'totalBenefit');
    this.totalCost = _.get(fhirResource, 'totalCost');
    this.type = _.get(fhirResource, 'type.coding', []);
    this.hasType = Array.isArray(this.type) && this.type.length > 0;
    this.services = _.get(fhirResource, 'item', []);
    this.hasServices = Array.isArray(this.services) && this.services.length > 0;
    this.information = _.get(fhirResource, 'information', []);
    this.hasInformation = Array.isArray(this.information) && this.information.length > 0;
    this.provider = _.get(fhirResource, 'provider');

    /**
     *
     * @param {Array} services
     * @returns {ExplanationOfBenefitServiceItem}
     */
    this.services = this.services.map(serviceItem => {
        const coding = _.get(serviceItem, 'service.coding.0');
        const servicedDate = _.get(serviceItem, 'servicedDate');
        const servicedPeriod = _.get(serviceItem, 'servicedPeriod');
        const quantity = _.get(serviceItem, 'quantity.value');
        const itemCost = _.get(serviceItem, 'net');
        return { coding, servicedDate, servicedPeriod, quantity, itemCost };
      });
  };

  r4DTO(fhirResource){
    this.type = _.get(fhirResource, 'type.coding', []);
    this.hasType = Array.isArray(this.type) && this.type.length > 0;
    this.resourceStatus = _.get(fhirResource, 'status');
    this.useCode = _.get(fhirResource, 'use');
    this.patient = _.get(fhirResource, 'patient');
    this.provider = _.get(fhirResource, 'provider');
    this.total = _.get(fhirResource, 'total', []);
    this.hasTotal = this.total.length > 0;
    this.services = _.get(fhirResource, 'item', []);
    this.hasServices = Array.isArray(this.services) && this.services.length > 0;
    this.information = _.get(fhirResource, 'supportingInfo', []);
    this.hasInformation = Array.isArray(this.information) && this.information.length > 0;
    this.procedures = _.get(fhirResource, 'procedure', []);

    // Person can have multiple insurances, but one with focal = true is used to judge this claim
    let insuranceList = _.get(fhirResource, 'insurance', []);
    let adjudicationInsurance = insuranceList.filter(item => item.focal)[0];
    this.insurance = _.get(adjudicationInsurance, 'coverage');

    /**
     *
     * @param {Array} services
     * @returns {ExplanationOfBenefitServiceItem}
     */
    this.services = this.services.map(serviceItem => {
      const coding =
        _.get(serviceItem, 'revenue.coding.0') ||
        _.get(serviceItem, 'productOrService.coding.0');
      const servicedDate = _.get(serviceItem, 'servicedDate');
      const servicedPeriod = _.get(serviceItem, 'servicedPeriod');
      const quantity = _.get(serviceItem, 'quantity.value');
      const itemCost = _.get(serviceItem, 'net');
      return { coding, servicedDate, servicedPeriod, quantity, itemCost };
    });
  };


  c4bbDTO(fhirResource){
    this.diagnosis = _.get(fhirResource, 'diagnosis', []);
    this.hasDiagnosis = this.diagnosis.length > 0;
    this.supportingInfo = _.get(fhirResource, 'supportingInfo', []);
    this.hasSupportingInfo = this.supportingInfo.length > 0;
    this.items = _.get(fhirResource, 'item', []);
    this.hasItems = this.items.length > 0;
    this.total = _.get(fhirResource, 'total', []);
    this.hasTotal = this.total.length > 0;
    this.payment = _.get(fhirResource, 'payment.amount');
    this.billablePeriod = _.get(fhirResource, 'billablePeriod');
    this.identifier = _.get(fhirResource, 'identifier');
    this.outcome = _.get(fhirResource, 'outcome');
    this.careTeam = _.get(fhirResource, 'careTeam', []);
    this.hasCareTeam = this.careTeam.length > 0;
    this.payeeType = _.get(fhirResource, 'payee.type');
    this.payeeParty = _.get(fhirResource, 'payee.party');
    this.related = _.get(fhirResource, 'related');

  };

  resourceDTO(fhirResource:any, fhirVersion: fhirVersions){
    switch (fhirVersion) {
      case fhirVersions.DSTU2:
        this.commonDTO(fhirResource)
        this.dstu2DTO(fhirResource)
        break
      case fhirVersions.STU3:
        this.commonDTO(fhirResource)
        this.stu3DTO(fhirResource)
        break;
      case fhirVersions.R4:
        this.commonDTO(fhirResource)
        this.r4DTO(fhirResource)

        //https://build.fhir.org/ig/HL7/carin-bb/StructureDefinition-C4BB-ExplanationOfBenefit.html
        if ((_.get(fhirResource, 'meta.profile[0]') || '').startsWith('http://hl7.org/fhir/us/carin-bb/StructureDefinition/C4BB')) {
          this.c4bbDTO(fhirResource)
        }

        break
      default:
        throw Error('Unrecognized the fhir version property type.');
    }
  };



}
