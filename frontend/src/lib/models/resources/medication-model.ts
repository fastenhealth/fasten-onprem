import {fhirVersions, ResourceType} from '../constants';
import * as _ from "lodash";
import {CodableConceptModel, hasValue} from '../datatypes/codable-concept-model';
import {ReferenceModel} from '../datatypes/reference-model';
import {CodingModel} from '../datatypes/coding-model';
import {FastenDisplayModel} from '../fasten/fasten-display-model';
import {FastenOptions} from '../fasten/fasten-options';

export class MedicationModel extends FastenDisplayModel {
  code: CodableConceptModel|undefined
  title: string|undefined
  is_brand: string|undefined
  manufacturer: string|undefined
  has_product_form:boolean|undefined
  product_form: string|undefined
  product_ingredient: string|undefined
  has_product_ingredient: boolean|undefined
  has_product: boolean|undefined
  package_coding: string|undefined
  has_package_coding: boolean|undefined
  has_images: boolean|undefined
  images: string|undefined
  status: string|undefined

  constructor(fhirResource: any, fhirVersion?: fhirVersions, fastenOptions?: FastenOptions) {
    super(fastenOptions)
    this.source_resource_type = ResourceType.Medication
    this.resourceDTO(fhirResource, fhirVersion || fhirVersions.R4);
  }

  commonDTO(fhirResource:any){
    this.code = _.get(fhirResource, 'code')
    this.title =  _.get(fhirResource, 'code.text') || _.get(fhirResource, 'code.coding.0.display');
    this.manufacturer = _.get(fhirResource, 'manufacturer');
  };

  dstu2DTO(fhirResource:any){
    this.product_form = _.get(fhirResource, 'product.form.coding', []);
    this.has_product_form = Array.isArray(this.product_form) && this.product_form.length > 0;
    this.product_ingredient = _.get(fhirResource, 'product.ingredient', []);
    this.has_product_ingredient =
      Array.isArray(this.product_ingredient) && this.product_ingredient.length > 0;
    this.has_product = this.has_product_form || this.has_product_ingredient;
    this.package_coding = _.get(fhirResource, 'package.container.coding', []);
    this.has_package_coding =
      Array.isArray(this.package_coding) && this.package_coding.length > 0;
    this.is_brand = _.get(fhirResource, 'isBrand');
  };

  stu3DTO(fhirResource:any){
    this.product_form = _.get(fhirResource, 'form.coding', []);
    this.has_product_form = Array.isArray(this.product_form) && this.product_form.length > 0;
    this.product_ingredient = _.get(fhirResource, 'ingredient', []);
    this.has_product_ingredient = Array.isArray(this.product_ingredient) && this.product_ingredient.length > 0;
    this. has_product = this.has_product_form || this.has_product_ingredient;
    this. package_coding = _.get(fhirResource, 'package.container.coding', []);
    this. has_package_coding =
      Array.isArray(this.package_coding) && this.package_coding.length > 0;
    this. images = _.get(fhirResource, 'image', []);
    this. has_images = true;
    if (
      !Array.isArray(this.images) ||
      this.images.filter(item => !!item.url).length === 0
    ) {
      this.has_images = false;
    }
    this. is_brand = _.get(fhirResource, 'isBrand');
  };

  r4DTO(fhirResource:any){
    this.product_form = _.get(fhirResource, 'form.coding', []);
    this.has_product_form = Array.isArray(this.product_form) && this.product_form.length > 0;
    this.product_ingredient = _.get(fhirResource, 'ingredient', []);
    this.has_product_ingredient =
      Array.isArray(this.product_ingredient) && this.product_ingredient.length > 0;
    this.status = _.get(fhirResource, 'status');
    this.has_product = this.has_product_form || this.has_product_ingredient;
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
