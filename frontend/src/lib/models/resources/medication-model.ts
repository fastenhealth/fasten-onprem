import {fhirVersions} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';

export class MedicationModel {
  title: CodingModel|undefined
  isBrand: string|undefined
  manufacturer: string|undefined
  hasProductForm:boolean|undefined
  productForm: string|undefined
  productIngredient: string|undefined
  hasProductIngredient: boolean|undefined
  hasProduct: boolean|undefined
  packageCoding: string|undefined
  hasPackageCoding: boolean|undefined
  hasImages: boolean|undefined
  images: string|undefined
  status: string|undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions) {
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }

  commonDTO(fhirResource:any){
    this.title = _.get(fhirResource, 'code.coding.0');
    if (!this.title) {
      this.title = { display: _.get(fhirResource, 'code.text', '') };
    }
    this.manufacturer = _.get(fhirResource, 'manufacturer');
  };

  dstu2DTO(fhirResource:any){
    this.productForm = _.get(fhirResource, 'product.form.coding', []);
    this.hasProductForm = Array.isArray(this.productForm) && this.productForm.length > 0;
    this.productIngredient = _.get(fhirResource, 'product.ingredient', []);
    this.hasProductIngredient =
      Array.isArray(this.productIngredient) && this.productIngredient.length > 0;
    this.hasProduct = this.hasProductForm || this.hasProductIngredient;
    this.packageCoding = _.get(fhirResource, 'package.container.coding', []);
    this.hasPackageCoding =
      Array.isArray(this.packageCoding) && this.packageCoding.length > 0;
    this.isBrand = _.get(fhirResource, 'isBrand');
  };

  stu3DTO(fhirResource:any){
    this.productForm = _.get(fhirResource, 'form.coding', []);
    this.hasProductForm = Array.isArray(this.productForm) && this.productForm.length > 0;
    this.productIngredient = _.get(fhirResource, 'ingredient', []);
    this.hasProductIngredient = Array.isArray(this.productIngredient) && this.productIngredient.length > 0;
    this. hasProduct = this.hasProductForm || this.hasProductIngredient;
    this. packageCoding = _.get(fhirResource, 'package.container.coding', []);
    this. hasPackageCoding =
      Array.isArray(this.packageCoding) && this.packageCoding.length > 0;
    this. images = _.get(fhirResource, 'image', []);
    this. hasImages = true;
    if (
      !Array.isArray(this.images) ||
      this.images.filter(item => !!item.url).length === 0
    ) {
      this.hasImages = false;
    }
    this. isBrand = _.get(fhirResource, 'isBrand');
  };

  r4DTO(fhirResource:any){
    this.productForm = _.get(fhirResource, 'form.coding', []);
    this.hasProductForm = Array.isArray(this.productForm) && this.productForm.length > 0;
    this.productIngredient = _.get(fhirResource, 'ingredient', []);
    this.hasProductIngredient =
      Array.isArray(this.productIngredient) && this.productIngredient.length > 0;
    this.status = _.get(fhirResource, 'status');
    this.hasProduct = this.hasProductForm || this.hasProductIngredient;
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
