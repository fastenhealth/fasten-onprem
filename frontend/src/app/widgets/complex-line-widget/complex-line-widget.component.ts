import { Component, OnInit } from '@angular/core';
import {NgChartsModule} from 'ng2-charts';
import {ChartConfiguration} from 'chart.js';
import {CommonModule} from '@angular/common';

@Component({
  standalone: true,
  imports: [NgChartsModule, CommonModule],
  selector: 'complex-line-widget',
  templateUrl: './complex-line-widget.component.html',
  styleUrls: ['./complex-line-widget.component.scss']
})
export class ComplexLineWidgetComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  pageViewChartData = [{
    label: 'This week',
    data: [36.57, 38.9, 42.3, 41.8, 37.4, 32.5, 28.1, 24.7, 23.4, 20.4, 16.5, 12.1, 9.2, 5.1, 9.6, 10.8, 13.2, 18.2, 13.9, 18.7, 13.7, 11.3, 13.7, 15.8, 12.9, 17.5, 21.9, 18.2, 14.3, 18.2, 14.8, 13.01, 14.5, 15.4, 16.6, 19.4, 14.5, 17.7, 13.8, 9.4, 11.9, 9.7, 6.1, 1.4, 2.3, 2.3, 4.5, 3.7, 5.7, 5.08, 1.9, 8.2,
      7.9, 5.02, 2.8, 6.8, 6.2, 9.8, 9.3, 11.9, 10, 9, 6, 4.5, 2.7, 4.3, 3.6, 4.2, 2, 1.4, 3.7, 1.5, 5.7, 4.9, 1, 4.7, 6.3, 4.2, 5.1, 5.2, 3.8, 8.2, 7.2, 6.5, 1.7, 11.4, 10.5, 3.8, 4.7, 8.5, 10.2, 11, 15.6, 19.7, 18.1, 13.5, 12, 7.5, 3.7, 9.7, 9.2, 13.4, 18.4, 22.4, 18.7, 15.2, 14.5, 14.4, 12, 13.7, 13.3, 15.4,
      15.8, 17.7, 14.3, 10.6, 12.7, 14.7, 18.6, 22.9, 18, 22.8, 23.8, 27.1, 24.7, 20, 22.7, 20.9, 16.6, 15.1, 13.1, 10.7, 11.4, 13.1, 10.1, 9.2, 9.2, 10.3, 15.2, 12.5, 14, 18.2, 16.3, 17.7, 18.9, 15.3, 18.1, 16.3, 14.8, 10 ],
    borderWidth: 2,
    fill: true,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderColor: 'rgb(0, 123, 255)'
  },
    {
      label: 'Current week',
      data: [53, 50.3, 49.4, 47.7, 49, 50.6, 48.7, 48.8, 53.5, 52.9, 49, 50.2, 48.3, 44.8, 40.7, 41.2, 45.6, 44.6, 41.3, 38.2, 39.6, 41, 39.4, 35.6, 38.5, 38.5, 40.6, 38.7, 42.9, 46.3, 43.5, 40.6, 36.5, 31.7, 28.9, 29.6, 29.5, 33.1, 37, 35.8, 37.6, 39.6, 39, 34.1, 37.4, 39.2, 38.4, 37.7, 40.1, 35.8, 31.5, 31.8,
        30.5, 25.7, 28.2, 28.4, 30, 32.1, 32.9, 37.6, 35.2, 39.1, 41.3, 41.4, 43.7, 39.4, 39.2, 43.8, 42.4, 43.6, 38.7 , 43.5, 41.8, 44.8, 46.1, 47.6, 49, 46.4, 51.2, 50.1, 53.6, 56, 52.7, 56.6, 60.2, 58.3, 56.5, 55.7, 54.7, 54.2, 58.6, 57, 60.5, 57.6, 56.1, 55.1, 54.3, 52.3, 54.5, 54.1, 51.9, 51.1, 46.3, 48.3,
        45.8, 48.2, 43.3, 45.8, 43.4, 41.3, 40.9, 38.4, 40.1, 44.8, 44, 41.4, 37.8, 39.2, 35.2, 32.1, 35.6, 38, 37.9, 38.7, 37.4, 37.5, 33.1, 35, 33.1, 31.8, 29.1, 31.9, 34.3, 32.9, 33.1, 37.1, 32.6, 36.9, 35.9, 38.1, 42.5, 41.5, 45.5, 46.3, 45.7, 45.4, 42.5, 44.4, 39.7, 44.7],
      borderWidth: 2,
      fill: true,
      backgroundColor: 'rgba(86, 11, 208, .05)',
      borderColor: 'rgb(86, 11, 208)',
    }] as ChartConfiguration<'line'>['data']['datasets']

  pageViewChartLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49',
    '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99',
    '100', '101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114', '115', '116', '117', '118', '119', '120', '121', '122', '123', '124', '125', '126', '127', '128', '129', '130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '140', '141', '142', '143', '144', '145', '146', '147', '148', '149'];

  pageViewChartOptions = {

    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        display: true,
        gridLines: {
          drawBorder: false,
          display: true,
          drawTicks: false,
          color: '#eef0fa',
          zeroLineColor: 'rgba(90, 113, 208, 0)',
        },
        ticks: {
          display: false,
          beginAtZero: true,
          min: 0,
          max: 100,
          stepSize: 32,
          padding: 10,
        }
      },
      x: {
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
      },
    },
    plugins: {
      legend: {
        display: false,
      }
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
  } as ChartConfiguration<'line'>['options']
}
