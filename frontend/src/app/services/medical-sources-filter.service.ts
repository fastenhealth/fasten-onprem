import { Injectable } from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';


export class MedicalSourcesFilter {
  searchAfter: string | string[] = '';
  query: string;
  platformTypes: string[] = [];
  categories: string[] = [];
  showHidden: boolean = false;

  fields: string[] = []; //specify the fields to return. if null or empty list, return all.
}


@Injectable({
  providedIn: 'root'
})
export class MedicalSourcesFilterService {
  filterForm = this.formBuilder.group({
    searchAfter: [''],
    query: [''],
    platformTypes: this.formBuilder.group({}),
    categories: this.formBuilder.group({}),
    showHidden: [false],
  })

  constructor(private formBuilder: FormBuilder) { }

  //parse angular query string parameters
  parseQueryParams(queryParams: {[name:string]:string}){

    var updateData: {
      searchAfter?: string,
      query?: string,
      platformTypes?: {},
      categories?: {},
      showHidden?: boolean,
    } = {};

    if(queryParams['searchAfter']){
      updateData.searchAfter = queryParams['searchAfter']
    }
    if(queryParams['query']){
      updateData.query = queryParams['query']
    }

    if(queryParams['platformTypes']){
      updateData.platformTypes = updateData.platformTypes ? updateData.platformTypes : {};
      for(let platformType of queryParams['platformTypes']?.split(',')){
        updateData.platformTypes[platformType] = true;
      }
    }
    if(queryParams['categories']){
      updateData.categories = updateData.categories ? updateData.categories : {};
      for(let category of queryParams['categories']?.split(',')){
        updateData.categories[category] = true;
      }
    }
    if(queryParams['showHidden']){
      updateData.showHidden = queryParams['showHidden'] == 'true';
    }


    //ensure that checkbox list values exist before trying to "patch" them in.
    if(updateData.platformTypes){
      var currentFileTypes = this.filterForm.get('platformTypes').value;
      Object.keys(updateData.platformTypes).forEach((bucketKey) => {
        if(!currentFileTypes.hasOwnProperty(bucketKey)){
          (this.filterForm.get('platformTypes') as FormGroup).addControl(bucketKey, new FormControl(false))
        }
      })
    }
    if(updateData.categories){
      Object.keys(updateData.categories).forEach((bucketKey) => {
        if(!this.filterForm.get('categories').get(bucketKey)){
          (this.filterForm.get('categories') as FormGroup).addControl(bucketKey, new FormControl(false))
        }
      })
    }

    return updateData;
  }

  toQueryParams() : {[name:string]:string} {
    var form = this.filterForm.value;

    var queryParams = {};

    // if(form.searchAfter){
    //   var searchAfter = [];
    //   Object.keys(form.searchAfter).forEach((key) => {
    //     if (form.searchAfter[key]) {
    //       searchAfter.push(key);
    //     }
    //   })
    //
    //   queryParams['searchAfter'] = searchAfter.join(',');
    // }
    if(form.query){
      queryParams['query'] = form.query
    }

    if(form.platformTypes && Object.keys(form.platformTypes).length){
      var platformTypes = [];
      Object.keys(form.platformTypes).forEach((key) => {
        if (form.platformTypes[key]) {
          platformTypes.push(key);
        }
      })

      queryParams['platformTypes'] = platformTypes.join(',');
    }

    if(form.categories && Object.keys(form.categories).length){
      var categories = [];
      Object.keys(form.categories).forEach((key) => {
        if (form.categories[key]) {
          categories.push(key);
        }
      })
      queryParams['categories'] = categories.join(',');
    }

    if(form.showHidden){
      queryParams['showHidden'] = form.showHidden.toString();
    }


    return queryParams;
  }

  toMedicalSourcesFilter(form): MedicalSourcesFilter {

    var medicalSourcesFilter = new MedicalSourcesFilter();

    if(form.searchAfter){
      medicalSourcesFilter.searchAfter = form.searchAfter
    }
    if(form.query){
      medicalSourcesFilter.query = form.query;
    }

    if(form.platformTypes){
      medicalSourcesFilter.platformTypes = [];
      Object.keys(form.platformTypes).forEach((key) => {
        if (form.platformTypes[key]) {
          medicalSourcesFilter.platformTypes.push(key);
        }
      })
    }
    if(form.categories){
      medicalSourcesFilter.categories = [];
      Object.keys(form.categories).forEach((key) => {
        if (form.categories[key]) {
          medicalSourcesFilter.categories.push(key);
        }
      })
    }

    if (form.showHidden) {
      medicalSourcesFilter.showHidden = form.showHidden;
    }

    return medicalSourcesFilter
  }

}
