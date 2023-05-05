import {Component, Input, OnInit} from '@angular/core';
import {ChartOptions} from 'chart.js';
import {DashboardWidgetConfig} from '../../models/widget/dashboard-widget-config';
import {ChartsModule} from 'ng2-charts';
import {CommonModule} from '@angular/common';
import {NgbDatepickerModule} from '@ng-bootstrap/ng-bootstrap';

@Component({
  standalone: true,
  imports: [ChartsModule, CommonModule, NgbDatepickerModule],
  selector: 'app-dashboard-widget',
  templateUrl: './dashboard-widget.component.html',
  styleUrls: ['./dashboard-widget.component.scss'],
})
export class DashboardWidgetComponent implements OnInit {

  @Input() widgetConfig: DashboardWidgetConfig;
  loading: boolean = false;

  chartData: any;
  chartLabels: any;
  chartOptions: any;
  chartColors: any;

  constructor() { }

  ngOnInit(): void {
    // this.widgetConfig = {
    //   id: "1",
    //   item_type: "line_chart",
    //   title_text: "Total Users",
    //   description_text: "Total users in the system",
    //   queries: [],
    //   width: 4,
    //   height: 4,
    //   x: 0,
    //   y: 0
    // }

    this.initLineChart()

    //  Total users chart
    // this.chartData = [{
    //   label: '# of Votes',
    //   data: [27.2, 29.9, 29.6, 25.7, 25.9, 29.3, 31.1, 27.9, 28.4, 25.4, 23.2, 18.2, 14, 12.7, 11, 13.7, 9.7, 12.6, 10.9, 12.7, 13.8],
    //   borderWidth: 1,
    //   fill: false
    // }];
    //
    // this.chartLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'];
    //
    // this.chartOptions = {
    //
    //   responsive:true,
    //   maintainAspectRatio:false,
    //   scales: {
    //     yAxes: [{
    //       display: false,
    //       ticks: {
    //         display: false,
    //       },
    //       gridLines: {
    //         drawBorder: false,
    //         display: false
    //       }
    //     }],
    //     xAxes: [{
    //       display: false,
    //       barThickness: 5.5,
    //       ticks: {
    //         display: false,
    //       },
    //       gridLines: {
    //         drawBorder: false,
    //         display: false
    //       }
    //     }]
    //
    //   },
    //   legend: {
    //     display: false
    //   },
    //   elements: {
    //     point: {
    //       radius: 0
    //     }
    //   }
    // };
    //
    // this.chartColors = [
    //   {
    //     backgroundColor: '#007bff',
    //     borderColor: '#007bff'
    //   }
    // ];

  }


  //private methods
  private initLineChart(){
    this.chartData = [{
      label: 'This week',
      data: [27.2, 29.9, 29.6, 25.7, 25.9, 29.3, 31.1, 27.9, 28.4, 25.4, 23.2, 18.2, 14, 12.7, 11, 13.7, 9.7, 12.6, 10.9, 12.7, 13.8, 12.9, 13.8, 10.2, 5.8, 7.6, 8.8, 5.6, 5.6, 6.3, 4.2, 3.6, 5.4, 6.5, 8.1, 10.9, 7.6, 9.7, 10.9, 9.5, 5.4, 4.9, .7, 2.3, 5.5, 10, 10.6, 8.3, 8.4, 8.5, 5.8 ],
      borderWidth: 2,
      fill: true
    }];

    this.chartLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51'];

    this.chartOptions = {

      responsive:true,
      maintainAspectRatio:false,
      scales: {
        yAxes: [{
          display: false,
          gridLines: {
            drawBorder: false,
            display: true,
            drawTicks: false,
          },
          ticks: {
            display: false,
            beginAtZero: true,
            min: 0,
            max: 40,
            stepSize: 10,
          }
        }],
        xAxes: [{
          display: false,
          position: 'bottom',
          gridLines: {
            drawBorder: false,
            display: false,
            drawTicks: false,
          },
          ticks: {
            beginAtZero: true,
            stepSize: 10,
            fontColor: "#a7afb7",
            padding: 10,
          }
        }],
      },
      legend: {
        display: false,
      },
      elements: {
        point: {
          radius: 0
        },
        line: {
          tension: 0
        }
      },
      tooltips: {
        backgroundColor: 'rgba(2, 171, 254, 1)',
      },
    };

    this.chartColors = [
      {
        backgroundColor: [
          'rgba(0, 204, 212, .2)',
        ],
        borderColor: [
          'rgb(0, 204, 212)'
        ]
      }
    ];
  }


}
