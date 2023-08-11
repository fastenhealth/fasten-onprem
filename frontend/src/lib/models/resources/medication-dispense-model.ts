import {fhirVersions, ResourceType} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';

export class MedicationDispenseModel extends FastenDisplayModel {
  code: CodableConceptModel | undefined
  medication_title: string|undefined
  medication_coding: string|undefined
  type_coding: string|undefined
  has_dosage_instruction: boolean|undefined
  dosage_instruction: any[] | undefined
  dosage_instruction_data: any[]|undefined
  when_prepared: string|undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.source_resource_type = ResourceType.MedicationDispense
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }


  commonDTO(fhirResource:any){
    this.code = _.get(fhirResource, 'medicationCodeableConcept');
    this.type_coding = _.get(fhirResource, 'type.coding.0');
    this.when_prepared = _.get(fhirResource, 'whenPrepared');
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

    this.medication_title = _.get(fhirResource, 'medicationReference.display');
    this.dosage_instruction = _.get(fhirResource, 'dosageInstruction', []);
    this.has_dosage_instruction = Array.isArray(this.dosage_instruction) && this.dosage_instruction.length > 0;
    this.dosage_instruction_data = prepareDosageInstructionData(this.dosage_instruction || []);
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
    this.medication_title =
      _.get(fhirResource, 'medicationReference.display') ||
      _.get(fhirResource, 'contained[0].code.coding[0].display');
    this.medication_coding = _.get(fhirResource, 'contained[0].code.coding[0]');
    this.dosage_instruction = _.get(fhirResource, 'dosageInstruction', []);
    this.has_dosage_instruction =
      Array.isArray(this.dosage_instruction) && this.dosage_instruction.length > 0;
    this.dosage_instruction_data = prepareDosageInstructionData(this.dosage_instruction);
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
    this.medication_title =
      _.get(fhirResource, 'medicationReference.display') ||
      _.get(fhirResource, 'contained[0].code.coding[0].display');
    this.medication_coding = _.get(fhirResource, 'contained[0].code.coding[0]');
    this.dosage_instruction = _.get(fhirResource, 'dosageInstruction', []);
    this.has_dosage_instruction =
      Array.isArray(this.dosage_instruction) && this.dosage_instruction.length > 0;
    this.dosage_instruction_data = prepareDosageInstructionData(this.dosage_instruction);
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
