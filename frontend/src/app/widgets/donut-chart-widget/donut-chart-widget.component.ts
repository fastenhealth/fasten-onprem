import { Component, OnInit } from '@angular/core';
import {NgChartsModule} from 'ng2-charts';
import {ChartConfiguration} from 'chart.js';
import {DashboardWidgetComponent} from '../dashboard-widget/dashboard-widget.component';
import {CommonModule} from '@angular/common';
import {LoadingWidgetComponent} from '../loading-widget/loading-widget.component';
import {EmptyWidgetComponent} from '../empty-widget/empty-widget.component';

@Component({
  standalone: true,
  imports: [NgChartsModule, CommonModule, LoadingWidgetComponent, EmptyWidgetComponent],
  selector: 'donut-chart-widget',
  templateUrl: './donut-chart-widget.component.html',
  styleUrls: ['./donut-chart-widget.component.scss']
})
export class DonutChartWidgetComponent extends DashboardWidgetComponent implements OnInit {

  doughnutChartDatasets: ChartConfiguration<'doughnut'>['data']['datasets'] = [];

  ngOnInit(): void {
    this.chartDatasetsDefaults = [{
      backgroundColor: ['#6f42c1', '#007bff','#17a2b8','#00cccc','#adb2bd'],
    }]
    super.ngOnInit()
    this.chartOptions.parsing = this.widgetConfig?.parsing
    // this.chartDatasetsSubject.subscribe(this.processQueryResults.bind(this))
  }

  // processQueryResults(queryResults: any[]) {
  //   if(!queryResults || queryResults.length < 1){
  //     return
  //   }
  // }

  // Sessions by channel doughnut chart
  // chartData = [{
  //   data: [25,20,30,15,10],
  // }] as ChartConfiguration<'doughnut'>['data']['datasets']

  // chartLabels: ['Search', 'Email', 'Referral', 'Social', 'Other'];
  chartOptions = {
    cutoutPercentage: 50,
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'right'
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true
    }
  } as ChartConfiguration['options']

}
