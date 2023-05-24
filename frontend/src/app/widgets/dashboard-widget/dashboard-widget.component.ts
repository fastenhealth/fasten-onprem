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

@Component({
  standalone: true,
  imports: [NgChartsModule, CommonModule, NgbDatepickerModule],
  selector: 'app-dashboard-widget',
  templateUrl: './dashboard-widget.component.html',
  styleUrls: ['./dashboard-widget.component.scss'],
})
export class DashboardWidgetComponent implements OnInit, DashboardWidgetComponentInterface {

  @Input() widgetConfig: DashboardWidgetConfig;
  loading: boolean = false;

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
  chartDatasets: ChartConfiguration<'line'>['data']['datasets'] = [];
  chartLabels: string[] = [];
  chartOptions: ChartOptions = {}
  // chartColors: any;

  constructor(public fastenApi: FastenApiService) { }

  ngOnInit(): void {
    if(!this.widgetConfig) {
      return
    }

    forkJoin(this.widgetConfig.queries.map(query => { return this.fastenApi.queryResources(query.q)})).subscribe((queryResults) => {
      this.chartDatasets = []

      for (let queryResult of queryResults) {
        console.log("QUERY RESULTS", queryResult)
        this.chartLabels = []
        for(let result of queryResult){
          this.chartLabels.push((result?.label || result?.timestamp || result?.id))
        }

        console.log("CHART Labels", this.chartLabels)

        this.chartDatasets.push({
          label: this.widgetConfig?.title_text,
          data: queryResult //.map(row => {row.data = 40; return row}),
          // data: [27.2, 29.9, 18.2, 14, 12.7, 11, 13.7, 9.7, 12.6, 50],
          // borderWidth: 2,
          // fill: true
        });
      }

      //push datasets for non-query components
      this.chartDatasetsSubject.next(queryResults)

    })
  }

}
