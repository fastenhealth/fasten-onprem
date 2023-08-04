import { Component, OnInit } from '@angular/core';
import {NgChartsModule} from 'ng2-charts';
import {ChartConfiguration} from 'chart.js';
import {DashboardWidgetComponent} from '../dashboard-widget/dashboard-widget.component';
import {CommonModule} from '@angular/common';
import {LoadingWidgetComponent} from '../loading-widget/loading-widget.component';
import {EmptyWidgetComponent} from '../empty-widget/empty-widget.component';
import {PipesModule} from '../../pipes/pipes.module';

@Component({
  standalone: true,
  imports: [NgChartsModule, CommonModule, LoadingWidgetComponent, EmptyWidgetComponent, PipesModule],
  selector: 'grouped-bar-chart-widget',
  templateUrl: './grouped-bar-chart-widget.component.html',
  styleUrls: ['./grouped-bar-chart-widget.component.scss']
})
export class GroupedBarChartWidgetComponent extends DashboardWidgetComponent implements OnInit {

  ngOnInit(): void {
    this.chartDatasetsDefaults = [{
      borderWidth: 1,
      backgroundColor: '#560bd0'
    }, {
      borderWidth: 1,
      backgroundColor: '#cad0e8'
    }]

    super.ngOnInit()
    this.chartOptions.parsing = this.widgetConfig?.parsing
  }

  chartOptions = {
    borderWidth: 1,
    responsive:true,
    maintainAspectRatio:false,
    scales: {
      y: {
        display: false,
        ticks: {
          beginAtZero:true,
          fontSize: 11,
          max: 80
        },
        gridLines: {
          drawBorder: false,
        }
      },
      x: {
        barPercentage: 0.6,
        gridLines: {
          color: 'rgba(0,0,0,0.08)',
          drawBorder: false
        },
        ticks: {
          beginAtZero:true,
          fontSize: 11,
          display: false
        }
      }

    },
    plugins: {
      legend: {
        display: false
      }
    },
    elements: {
      point: {
        radius: 0
      }
    },
  } as ChartConfiguration<'bar'>['options']
}
