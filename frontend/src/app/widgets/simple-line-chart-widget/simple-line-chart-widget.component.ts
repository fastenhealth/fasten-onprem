import {Component, Input, OnInit} from '@angular/core';
import {NgChartsModule} from 'ng2-charts';
import {DashboardWidgetConfig} from '../../models/widget/dashboard-widget-config';
import {FastenApiService} from '../../services/fasten-api.service';
import {DashboardWidgetComponent} from '../dashboard-widget/dashboard-widget.component';
import {ChartConfiguration, ChartDataset, ChartOptions} from 'chart.js';

@Component({
  standalone: true,
  imports: [NgChartsModule],
  selector: 'simple-line-chart-widget',
  templateUrl: './simple-line-chart-widget.component.html',
  styleUrls: ['./simple-line-chart-widget.component.scss']
})
export class SimpleLineChartWidgetComponent extends DashboardWidgetComponent implements OnInit {

  ngOnInit(): void {
    // super.ngOnInit()

    // if(!this.widgetConfig) {
      this.widgetConfig = new DashboardWidgetConfig()
      this.widgetConfig.title_text = "Weight"

      // this.chartLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51']
      this.chartLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
      this.chartData = [{
        label: 'This week',
        // data: [27.2, 29.9, 29.6, 25.7, 25.9, 29.3, 31.1, 27.9, 28.4, 25.4, 23.2, 18.2, 14, 12.7, 11, 13.7, 9.7, 12.6, 10.9, 12.7, 13.8, 12.9, 13.8, 10.2, 5.8, 7.6, 8.8, 5.6, 5.6, 6.3, 4.2, 3.6, 5.4, 6.5, 8.1, 10.9, 7.6, 9.7, 10.9, 9.5, 5.4, 4.9, .7, 2.3, 5.5, 10, 10.6, 8.3, 8.4, 8.5, 5.8 ],
        // data: [27.2, 29.9, 29.6, 25.7, 25.9, 29.3, 31.1, 27.9, 28.4, 25.4 ],
        data: [
          {id: 'a', data: 27.2},
          {id: 'b', data: 29.9},
          {id: 'c', data: 29.6},
          {id: 'd', data: 25.7},
          {id: 'e', data: 25.9},
          {id: 'f', data: 29.3},
          {id: 'g', data: 31.1},
          {id: 'h', data: 27.9},
          {id: 'i', data: 28.4},
          {id: 'j', data: 25.4},
          {id: 'k', data: 27.2},
          {id: 'l', data: 29.9},
          {id: 'm', data: 29.6},
          {id: 'n', data: 25.7},
          {id: 'o', data: 25.9},
          {id: 'p', data: 29.3},
          {id: 'q', data: 31.1},
          {id: 'r', data: 27.9},
          {id: 's', data: 28.4},
          {id: 't', data: 25.4}
        ],
        // parsing: {
        //   xAxisKey: 'id',
        //   yAxisKey: 'data'
        // },
      }] as unknown as ChartConfiguration<'line'>['data']['datasets']
    // }
  }


  chartOptions = {
    responsive:true,
    maintainAspectRatio:false,
    scales: {
      y: {
        display: false,
        gridLines: {
          drawBorder: false,
          display: true,
          drawTicks: false,
        },
        ticks: {
          display: false,
          beginAtZero: false,
          // min: 0,
          // max: 40,
          stepSize: 10,
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
          beginAtZero: false,
          stepSize: 10,
          fontColor: "#a7afb7",
          padding: 10,
        }
      },
    },
    plugins:{
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

    backgroundColor: 'rgba(0, 204, 212, .2)',
    borderColor:  'rgb(0, 204, 212)',
    borderWidth: 2,
    fill: true,

    parsing: {
      xAxisKey: 'id',
      yAxisKey: 'data'
    }
  } as ChartConfiguration<'line'>['options']

}
