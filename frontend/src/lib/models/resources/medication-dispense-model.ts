import {fhirVersions} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';

export class MedicationDispenseModel {
  medicationTitle: string|undefined
  medicationCoding: string|undefined
  typeCoding: string|undefined
  hasDosageInstruction: boolean|undefined
  dosageInstruction: any[] | undefined
  dosageInstructionData: any[]|undefined
  whenPrepared: string|undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions) {
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }


  commonDTO(fhirResource:any){
    this.typeCoding = _.get(fhirResource, 'type.coding.0');
    this.whenPrepared = _.get(fhirResource, 'whenPrepared');
  };

  dstu2DTO(fhirResource:any){
   const prepareDosageInstructionData = (rawData: any[]) => {
      return rawData.map((item: any) => {
        const data:any = {};
        data.route = _.get(item, 'route.coding.0.display');
        if (_.get(item, 'doseQuantity')) {
          data.doseQuantity = `${_.get(item, 'doseQuantity.value')} ${_.get(
            item,
            'doseQuantity.unit',
          )}`;
        }
        if (_.get(item, 'additionalInstructions.coding')) {
          data.additionalInstructions = _.get(item, 'additionalInstructions', '');
        }
        const timingRepeat = _.get(item, 'timing.repeat');
        if (timingRepeat) {
          data.timing = `${timingRepeat.period} / ${timingRepeat.periodUnits}`;
        }

        return data;
      });
    };

    this.medicationTitle = _.get(fhirResource, 'medicationReference.display');
    this.dosageInstruction = _.get(fhirResource, 'dosageInstruction', []);
    this.hasDosageInstruction = Array.isArray(this.dosageInstruction) && this.dosageInstruction.length > 0;
    this.dosageInstructionData = prepareDosageInstructionData(this.dosageInstruction || []);
  };

  stu3DTO(fhirResource:any){
    const prepareDosageInstructionData = (rawData:any) => {
      return rawData.map((item: any) => {
        const data:any = {};
        data.route = _.get(item, 'route.coding.0.display');
        if (_.get(item, 'doseQuantity')) {
          data.doseQuantity = `${_.get(item, 'doseQuantity.value')} ${_.get(
            item,
            'doseQuantity.unit',
          )}`;
        }
        if (_.get(item, 'additionalInstruction.0.coding')) {
          data.additionalInstructions = _.get(item, 'additionalInstruction.0', '');
        }
        const timingRepeat = _.get(item, 'timing.repeat');
        if (timingRepeat) {
          data.timing = `${timingRepeat.period} / ${timingRepeat.periodUnit}`;
        }

        return data;
      });
    };
    this.medicationTitle =
      _.get(fhirResource, 'medicationReference.display') ||
      _.get(fhirResource, 'contained[0].code.coding[0].display');
    this.medicationCoding = _.get(fhirResource, 'contained[0].code.coding[0]');
    this.dosageInstruction = _.get(fhirResource, 'dosageInstruction', []);
    this.hasDosageInstruction =
      Array.isArray(this.dosageInstruction) && this.dosageInstruction.length > 0;
    this.dosageInstructionData = prepareDosageInstructionData(this.dosageInstruction);
  };

  r4DTO(fhirResource:any){
    const prepareDosageInstructionData = (rawData:any) => {
      return rawData.map((item: any) => {
        const data:any = {};
        data.route = _.get(item, 'route.coding.0.display');
        if (_.get(item, 'doseAndRate.0.doseQuantity')) {
          data.doseQuantity = `${_.get(
            item,
            'doseAndRate.0.doseQuantity.value',
          )} ${_.get(item, 'doseAndRate.0.doseQuantity.unit')}`;
        }
        if (_.get(item, 'doseAndRate.0.type.coding')) {
          data.additionalInstructions = _.get(item, 'doseAndRate.0.type');
        }
        const timingRepeat = _.get(item, 'timing.repeat');
        if (timingRepeat) {
          data.timing = `${timingRepeat.period} / ${timingRepeat.periodUnit}`;
        }

        return data;
      });
    };
    this.medicationTitle =
      _.get(fhirResource, 'medicationReference.display') ||
      _.get(fhirResource, 'contained[0].code.coding[0].display');
    this.medicationCoding = _.get(fhirResource, 'contained[0].code.coding[0]');
    this.dosageInstruction = _.get(fhirResource, 'dosageInstruction', []);
    this.hasDosageInstruction =
      Array.isArray(this.dosageInstruction) && this.dosageInstruction.length > 0;
    this.dosageInstructionData = prepareDosageInstructionData(this.dosageInstruction);
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
