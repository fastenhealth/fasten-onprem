import { Injectable } from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {debounceTime, pairwise, startWith} from 'rxjs/operators';
import {Router} from '@angular/router';
import * as _ from 'lodash';
import {BehaviorSubject} from 'rxjs';


export class MedicalSourcesFilter {
  //primary search terms (changes here should restart the search completely)
  query: string;

  //secondary search terms/facets (changes here should restart pagination)
  platformTypes: string[] = [];
  categories: string[] = [];
  showHidden: boolean = false;

  //pagination - this is the current page (changes here should be ignored)
  searchAfter: string | string[] = '';

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

  filterChanges = new BehaviorSubject<{filter: MedicalSourcesFilter, changed:string[] }>(null);

  constructor(
    private formBuilder: FormBuilder,
    // private router: Router,
  ) {

    // //changing the form, should change the URL, BUT NOT do a query
    // this.filterForm.valueChanges.pipe(debounceTime(100)).subscribe(val => {
    //   console.log("FILTER FORM CHANGED:", val, this.toQueryParams())
    //
    //   // change the browser url whenever the filter is updated.
    //   this.updateBrowserUrl(this.toQueryParams())
    // })


    this.filterForm.valueChanges
      //see https://stackoverflow.com/questions/44898010/form-control-valuechanges-gives-the-previous-value
      .pipe(startWith(null), pairwise())
      .subscribe(pairParams => {
        let prevParams = this.toMedicalSourcesFilter(pairParams[0])
        let nextParams = this.toMedicalSourcesFilter(pairParams[1])
        let changed = [];

        //check if primary has changed
        if(!_.isEqual(prevParams.query, nextParams.query)){
          changed.push('query')
          this.resetSecondary();
          nextParams.platformTypes = [];
          nextParams.categories = [];
          nextParams.showHidden = false;

          this.resetPagination();
          nextParams.searchAfter = ''

          //check if secondary/facets have changed
        } else if (!_.isEqual(prevParams.platformTypes, nextParams.platformTypes)
          || !_.isEqual(prevParams.categories, nextParams.categories)
          || !_.isEqual(prevParams.showHidden, nextParams.showHidden)
        ){
          if(!_.isEqual(prevParams.platformTypes, nextParams.platformTypes)){
            changed.push('platformTypes')
          }
          if(!_.isEqual(prevParams.categories, nextParams.categories)){
            changed.push('categories')
          }
          if(!_.isEqual(prevParams.showHidden, nextParams.showHidden)){
            changed.push('showHidden')
          }
          this.resetPagination();
          nextParams.searchAfter = ''
        }

        //emit the changes
        if (changed.length > 0){
          console.log("FILTER FORM - CHANGED:", nextParams, changed)

          this.filterChanges.next({
            filter: nextParams,
            changed: changed
          })
        } else {
          console.log("FILTER FORM - NO CHANGES:", nextParams)
        }
      })
  }

  resetPrimary(emit: boolean = false){
    this.filterForm.get('query').reset(undefined, {emitEvent: emit});
  }
  resetSecondary(emit: boolean = false){
    this.filterForm.get('platformTypes').reset(undefined, {emitEvent: emit});
    this.filterForm.get('categories').reset(undefined, {emitEvent: emit});
    this.filterForm.get('showHidden').reset(undefined, {emitEvent: emit});
  }
  resetPagination(emit: boolean = false){
    this.filterForm.get('searchAfter').reset(undefined, {emitEvent: emit});
  }

  //
  // updateBrowserUrl(queryParams: {[name: string]: string}){
  //   console.log("update the browser url with query params data", queryParams)
  //   this.router.navigate(['/sources'], { queryParams: queryParams })
  // }

  resetControl(controlName: string){
    this.filterForm.get(controlName).reset();
  }

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
      Object.keys(updateData.platformTypes).forEach((bucketKey) => {
        if(!this.filterForm.get('platformTypes').get(bucketKey)){
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

  toQueryParams(form) : {[name:string]:string} {
    if(!form){
      form = this.filterForm.value;
    }

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
    if(!form){
      return medicalSourcesFilter
    }
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
