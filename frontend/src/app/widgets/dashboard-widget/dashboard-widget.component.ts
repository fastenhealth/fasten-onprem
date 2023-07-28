import {Component, Input, OnInit} from '@angular/core';
import {ChartConfiguration, ChartDataset, ChartOptions} from 'chart.js';
import {DashboardWidgetConfig} from '../../models/widget/dashboard-widget-config';
import {NgChartsModule} from 'ng2-charts';
import {CommonModule} from '@angular/common';
import {NgbDatepickerModule} from '@ng-bootstrap/ng-bootstrap';
import {DashboardWidgetComponentInterface} from '../dashboard-widget-component-interface';
import {FastenApiService} from '../../services/fasten-api.service';
import {forkJoin} from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import * as _ from 'lodash';
import {LoadingWidgetComponent} from '../loading-widget/loading-widget.component';
import {ResponseWrapper} from '../../models/response-wrapper';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {DashboardWidgetQuery} from '../../models/widget/dashboard-widget-query';
import fhirpath from 'fhirpath';
import {map} from 'rxjs/operators';

@Component({
  standalone: true,
  imports: [NgChartsModule, CommonModule, NgbDatepickerModule, LoadingWidgetComponent],
  selector: 'app-dashboard-widget',
  templateUrl: './dashboard-widget.component.html',
  styleUrls: ['./dashboard-widget.component.scss'],
})
export class DashboardWidgetComponent implements OnInit, DashboardWidgetComponentInterface {

  @Input() widgetConfig: DashboardWidgetConfig;
  loading: boolean = true;
  isEmpty: boolean = true;

  chartDatasetsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([])
  // chartData: {
  //   label: string,
  //   clip?: number |object,
  //   order?: number,
  //   stack?: string,
  //   data: any[],
  //   parsing?: {
  //     yAxisKey?: string,
  //     xAxisKey?: string,
  //     key?: string,
  //   }
  //   // borderWidth: number,
  //   // fill: boolean,
  // }[] = [];
  chartDatasetsDefaults = [];
  chartDatasets: ChartConfiguration<'line'>['data']['datasets'] = [];
  chartLabels: any[] | string[] = [];
  chartOptions: ChartOptions = {}
  // chartColors: any;

  constructor(public fastenApi: FastenApiService) {
    this.loading = true
  }

  ngOnInit(): void {
    if(!this.widgetConfig) {
      return
    }
    this.loading = true
    var currentThis = this
    forkJoin(this.widgetConfig.queries.map(query => {
      return this.fastenApi.queryResources(query.q).pipe(
        map((responseWrapper: ResponseWrapper) => {
          return this.processQueryResourcesSelectClause(query.q, responseWrapper)
        })
      )
    })).subscribe(
      this.chartProcessQueryResults.bind(currentThis),
      (error) => {
        this.loading = false
      },
      () => {
        console.log("complete")
      })
  }

  //process query requests for chartJS library. This is the default implementation, but can be overridden by child classes
  chartProcessQueryResults(queryResults: any[]) {

    try {
      this.chartDatasets = []

      for (let queryNdx in queryResults) {
        let queryResult = queryResults[queryNdx]
        console.log(`QUERY RESULTS FOR ${this.widgetConfig.title_text}`, queryResult)
        this.chartLabels = []
        // console.log(`CHART LABELS BEFORE ${this.widgetConfig.title_text}`, this.chartLabels)
        for(let result of queryResult){
          let label = (result?.[this.widgetConfig?.parsing?.label] ||  result?.label || result?.timestamp || result?.id || '')
          // if(Array.isArray(label)){
          //   this.chartLabels.push(...label)
          // } else {
          this.isEmpty = false
          this.chartLabels.push(label)
          // }
        }

        console.log(`CHART LABELS FOR ${this.widgetConfig.title_text}`, this.chartLabels)

        this.chartDatasets.push(_.extend(
          this.chartDatasetsDefaults?.[queryNdx] || {},
          this.widgetConfig.queries?.[queryNdx]?.dataset_options || {},
          {
            data: queryResult, //.map(row => {row.data = 40; return row}),
          }
        ));
      }

      //push datasets for non-query components
      this.chartDatasetsSubject.next(queryResults)
      this.loading = false
    } catch(e){
      console.error("ERROR DURING PROCESSING")
      console.error(e)
    }



    console.log(`Loading COmpleted for ${this.widgetConfig.title_text}, ${this.loading}`)
  }

  getLastDatasetValue(dataset: ChartDataset<'line'>): string {
    let lastItem = dataset?.data?.[dataset?.data?.length -1] || ''
    let valueKey = this.chartOptions?.parsing?.['yAxisKey'] || dataset?.parsing?.['key']
    console.log('current', lastItem, valueKey)

    if(typeof lastItem === 'string'){
      console.log('lastItem-string', lastItem)
      return lastItem
    } else if(Array.isArray(lastItem)){

      return _.flatten(lastItem?.[0]?.[valueKey])?.[0] as string
    } else if(typeof lastItem === 'object'){
      console.log('lastItem-object', lastItem?.[valueKey])
      return lastItem?.[valueKey]
    } else {
      return lastItem.toString()
    }
  }



  // This function will process the raw response from the Dashboard Query API call, which requires frontend processing of the select clause.
  // it will call the fhirPathMapQueryFn which will extract FHIRPath values from the resource_raw field of the ResourceFhir object
  // fhirPathMapQueryFn will also assign aliases where appropriate.
  // `where` clause filtering is processed in the backend.
  processQueryResourcesSelectClause(query: DashboardWidgetQuery, response: ResponseWrapper): any[]{
    console.log("RESPONSE", response)
    if(!response.data || !response.data.length){
      console.log("NO QUERY DATA FOUND")
      return []
    }
    let results = response.data
      .map((resource: ResourceFhir) => {
        if (!resource.resource_raw) {
          return null
        }
        return this.fhirPathMapQueryFn(query)(resource.resource_raw)
      })

    if(query.aggregation_type){
      switch (query.aggregation_type) {
        case "countBy":

          return Object.entries(_[query.aggregation_type](results, ...(query.aggregation_params || []))).map(pair => {
            return {key: pair[0], value: pair[1]}
          })

          break;
        default:
          throw new Error("unsupported aggregation type")
      }
    }
    else {
      return results
    }
  }


  // This function will convert DashboardWidgetQuery.select filters into a FHIRPath query strings and return the results
  // as a map (keyed by the select alias)
  // ie. `name.where(given='Jim')` will be converted to `Patient.name.where(given='Jim')`
  // ie. `name.where(given='Jim') as GivenName` will be converted to `Patient.name.where(given='Jim')` and be stored in the returned map as GivenName`
  // the returned map will always contain a `id` key, which will be the resource id and a `resourceType` key, which will be the resource type
  fhirPathMapQueryFn(query: DashboardWidgetQuery): (rawResource: any) => { [name:string]: string | string[] | any }  {
    let selectPathFilters: { [name:string]: string } = query.select.reduce((selectAliasMap, selectPathFilter): { [name:string]: string } => {
      let alias = selectPathFilter
      let selectPath = selectPathFilter
      if(selectPathFilter.indexOf(" as ") > -1){
        let selectPathFilterParts = selectPathFilter.split(" as ")
        selectPath = selectPathFilterParts[0] as string
        alias = selectPathFilterParts[1] as string
      } else if(selectPathFilter.indexOf(" AS ") > -1){
        let selectPathFilterParts = selectPathFilter.split(" AS ")
        selectPath = selectPathFilterParts[0] as string
        alias = selectPathFilterParts[1] as string
      }

      selectAliasMap[alias] = selectPath
      // if(selectPath == '*'){
      //   selectAliasMap[alias] = selectPath
      // } else {
      //   selectAliasMap[alias] = `${query.from}.${selectPath}`
      // }

      return selectAliasMap
    }, {})

    // console.log(selectPathFilters)
    return function(rawResource: any):{ [name:string]: string | string[] | any } {
      let results = {}
      for(let alias in selectPathFilters){
        let selectPathFilter = selectPathFilters[alias]
        if(selectPathFilter == '*'){
          results[alias] = rawResource
        } else {
          results[alias] = fhirpath.evaluate(rawResource, selectPathFilter)
        }
      }

      results["id"] = rawResource.id
      results["resourceType"] = rawResource.resourceType
      return results
    }
  }



}
