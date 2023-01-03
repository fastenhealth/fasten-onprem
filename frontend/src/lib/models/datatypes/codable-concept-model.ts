import * as _ from "lodash";
import {CodingModel} from './coding-model';

/**
 * Helper function for checking if parameter is not empty array or object
 * with at least one key
 * @param {any} data
 * @returns {boolean}
 */
export function hasValue(data:any ): boolean {
  if (Array.isArray(data)) return data.length > 0;
  if (_.isObject(data)) return Object.keys(data).length > 0;

  return false;
};

export class CodableConceptModel {
  text?: string
  coding: CodingModel[]
  constructor(fhirData: any) {
    this.text = _.get(fhirData, 'text', '');
    this.coding = _.get(fhirData, 'coding', []);
  }
}
