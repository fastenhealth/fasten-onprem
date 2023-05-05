import { Component, OnInit } from '@angular/core';
import {ChartsModule} from 'ng2-charts';

@Component({
  standalone: true,
  imports: [ChartsModule],
  selector: 'app-grouped-bar-chart-widget',
  templateUrl: './grouped-bar-chart-widget.component.html',
  styleUrls: ['./grouped-bar-chart-widget.component.scss']
})
export class GroupedBarChartWidgetComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  sessionsChartData = [{
    label: '# of Votes',
    data: [2, 4, 10, 20, 45, 40, 35, 18],
    borderWidth: 1,
    fill: false
  },
    {
      label: '# of Rate',
      data: [3, 6, 15, 35, 50, 45, 35, 25],
      borderWidth: 1,
      fill: false
    }];

  sessionsChartLabels = [0,1,2,3,4,5,6,7];

  sessionsChartOptions = {

    responsive:true,
    maintainAspectRatio:false,
    scales: {
      yAxes: [{
        display: false,
        ticks: {
          beginAtZero:true,
          fontSize: 11,
          max: 80
        },
        gridLines: {
          drawBorder: false,
        }
      }],
      xAxes: [{
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
      }]

    },
    legend: {
      display: false
    },
    elements: {
      point: {
        radius: 0
      }
    }
  };

  sessionsChartColors = [
    {
      backgroundColor: '#560bd0'
    },
    {
      backgroundColor: '#cad0e8'
    }
  ];
}
