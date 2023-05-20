import {Component, Input, OnInit} from '@angular/core';
import {ChartOptions} from 'chart.js';
import {DashboardWidgetConfig} from '../../models/widget/dashboard-widget-config';
import {ChartsModule} from 'ng2-charts';
import {CommonModule} from '@angular/common';
import {NgbDatepickerModule} from '@ng-bootstrap/ng-bootstrap';
import {DashboardWidgetComponentInterface} from '../dashboard-widget-component-interface';
import {FastenApiService} from '../../services/fasten-api.service';

@Component({
  standalone: true,
  imports: [ChartsModule, CommonModule, NgbDatepickerModule],
  selector: 'app-dashboard-widget',
  templateUrl: './dashboard-widget.component.html',
  styleUrls: ['./dashboard-widget.component.scss'],
})
export class DashboardWidgetComponent implements OnInit, DashboardWidgetComponentInterface {

  @Input() widgetConfig: DashboardWidgetConfig;
  loading: boolean = false;

  chartData: {
    label: string,
    data: number[],
    borderWidth: number,
    fill: boolean,
  }[] = [];
  chartLabels: string[] = [];
  chartOptions: any;
  chartColors: any;

  constructor(public fastenApi: FastenApiService) { }

  ngOnInit(): void {
    if(!this.widgetConfig) {
      return
    }
    this.fastenApi.queryResources(this.widgetConfig.queries[0].q).subscribe((results) => {
      console.log("QUERY RESULTS", results)
      this.chartLabels = []
      let chartData = []
      for(let result of results){
        this.chartLabels.push((result?.label || result?.timestamp || result?.id))

        chartData.push(...(result?.data || []))
      }

      console.log("CHART DATA", chartData)
      console.log("CHART Labels", this.chartLabels)
      this.chartData = [{
        label: this.widgetConfig?.title_text,
        data: chartData,
        // data: [27.2, 29.9, 18.2, 14, 12.7, 11, 13.7, 9.7, 12.6, 50],
        borderWidth: 2,
        fill: true
      }];

    })
  }

}
