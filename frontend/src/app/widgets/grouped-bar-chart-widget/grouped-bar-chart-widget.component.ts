import { Component, OnInit } from '@angular/core';
import {NgChartsModule} from 'ng2-charts';
import {ChartConfiguration} from 'chart.js';

@Component({
  standalone: true,
  imports: [NgChartsModule],
  selector: 'grouped-bar-chart-widget',
  templateUrl: './grouped-bar-chart-widget.component.html',
  styleUrls: ['./grouped-bar-chart-widget.component.scss']
})
export class GroupedBarChartWidgetComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  sessionsChartData = [
    {
      label: '# of Votes',
      data: [2, 4, 10, 20, 45, 40, 35, 18],
      borderWidth: 1,
      // fill: false,
      backgroundColor: '#560bd0'
    },
    {
      label: '# of Rate',
      data: [3, 6, 15, 35, 50, 45, 35, 25],
      borderWidth: 1,
      // fill: false,
      backgroundColor: '#cad0e8'
    }
  ] as ChartConfiguration<'bar'>['data']['datasets']

  sessionsChartLabels = [0,1,2,3,4,5,6,7];

  sessionsChartOptions = {

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
    }
  } as ChartConfiguration<'bar'>['options']
}
