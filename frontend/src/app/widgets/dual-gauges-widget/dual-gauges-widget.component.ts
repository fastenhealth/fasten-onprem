import { Component, OnInit } from '@angular/core';
import {NgChartsModule} from 'ng2-charts';
import {CommonModule} from '@angular/common';
import {DashboardWidgetComponent} from '../dashboard-widget/dashboard-widget.component';
import {ChartConfiguration} from 'chart.js/dist/types';
import {LoadingWidgetComponent} from '../loading-widget/loading-widget.component';
import {EmptyWidgetComponent} from '../empty-widget/empty-widget.component';
import {PipesModule} from '../../pipes/pipes.module';

@Component({
  standalone: true,
  imports: [NgChartsModule,CommonModule, LoadingWidgetComponent, EmptyWidgetComponent, PipesModule],
  selector: 'dual-gauges-widget',
  templateUrl: './dual-gauges-widget.component.html',
  styleUrls: ['./dual-gauges-widget.component.scss']
})
export class DualGaugesWidgetComponent extends DashboardWidgetComponent implements OnInit  {

  ngOnInit(): void {
    super.ngOnInit()
    this.chartOptions.parsing = this.widgetConfig?.parsing
  }

  chartDatasetsDefaults: [{
    backgroundColor: ['#007bff', '#cad0e8'],
    borderColor: ['#007bff', '#cad0e8'],
  },{
    backgroundColor: ['#00cccc', '#cad0e8'],
    borderColor: ['#00cccc', '#cad0e8']
  }]

  // // Sessions by channel doughnut chart
  // sessionsChartOneData = [{
  //   data: [40,60],
  //
  // }];

  // sessionsChartOneLabels: ['Search', 'Email'];
  chartOptions = {
    cutoutPercentage: 78,
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true
    }
  } as ChartConfiguration['options']

  // Sessions by channel doughnut chart
  // sessionsChartTwoData = [{
  //   data: [25,75],
  //
  // }];

  // sessionsChartTwoLabels: ['Search', 'Email'];

}
