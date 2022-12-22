import {Component, Input, OnInit} from '@angular/core';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {ChartOptions} from 'chart.js';
// import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
// import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-report-labs-observation',
  templateUrl: './report-labs-observation.component.html',
  styleUrls: ['./report-labs-observation.component.scss']
})
export class ReportLabsObservationComponent implements OnInit {

  @Input() observations: ResourceFhir[]
  @Input() observationCode: string
  @Input() observationTitle: string

  // barChartData = [{
  //   label: '# of Votes',
  //   stack: 1,
  //   data: [[12,20], 39, 20, 10, 55, 18],
  // },{
  //   label: '# of Votes',
  //   stack: 2,
  //   data: [12, 39, 20, 10, 55, 18],
  // },{
  //   label: '# of Votes',
  //   stack: 3,
  //   data: [12, 39, 20, 10, 55, 18],
  // },{
  //   label: '# of Votes',
  //   stack: 4,
  //   data: [12, 39, 20, 10, 55, 18],
  // }];


  barChartData = [{
    label: 'Line 1',
    data: [12, 39, 20, 10, 55, 18],
    backgroundColor: '#3788d8cc',
    borderColor: '#3788d8cc',
    fill: false
  },  {
    label: 'Line 2',
    data: [82, 49, 30, 10, 25, 18],
    backgroundColor: '#ff9800',
    borderColor: '#ff9800',
    fill: false
  }]

  barChartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  barChartOptions = {
    scales: {
      yAxes: [{
        stacked: true,
        ticks: {
          beginAtZero: true,
          fontSize: 10,
          min:0,
          max: 80
        }
      }],
      xAxes: [{
        stacked: true,
        // barPercentage: 0.6,
        ticks: {
          beginAtZero:true,
          fontSize: 11
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
  } as ChartOptions

  barChartColors = [
    {
      backgroundColor: '#560bd0'
    }
  ];


  constructor() { }

  ngOnInit(): void {
  }

}
