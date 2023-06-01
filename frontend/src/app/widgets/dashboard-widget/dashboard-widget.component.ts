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
  chartLabels: string[] = [];
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
    forkJoin(this.widgetConfig.queries.map(query => { return this.fastenApi.queryResources(query.q)})).subscribe((queryResults) => {
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

    }, (error) => {
      this.loading = false
    })
  }

  getLastDatasetValue(dataset: ChartDataset<'line'>): string {
    let lastItem = dataset?.data?.splice(-1) || ''
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
      return lastItem
    }
  }

}
