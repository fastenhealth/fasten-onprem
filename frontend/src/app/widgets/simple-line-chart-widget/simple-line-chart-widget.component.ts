import {Component, Input, OnInit} from '@angular/core';
import {ChartsModule} from 'ng2-charts';
import {DashboardWidgetConfig} from '../../models/widget/dashboard-widget-config';
import {FastenApiService} from '../../services/fasten-api.service';

@Component({
  standalone: true,
  imports: [ChartsModule],
  selector: 'app-simple-line-chart-widget',
  templateUrl: './simple-line-chart-widget.component.html',
  styleUrls: ['./simple-line-chart-widget.component.scss']
})
export class SimpleLineChartWidgetComponent implements OnInit {

  @Input() widgetConfig: DashboardWidgetConfig;

  constructor(private fastenApi: FastenApiService) { }

  chartLabels: string[] = [];
  chartData: {
    label: string,
    data: number[],
    borderWidth: number,
    fill: boolean,
  }[] = []

  ngOnInit(): void {
    if(!this.widgetConfig) {
      this.widgetConfig = new DashboardWidgetConfig()
      this.widgetConfig.title_text = "Weight"

      this.chartLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51']
      this.chartData = [{
        label: 'This week',
        data: [27.2, 29.9, 29.6, 25.7, 25.9, 29.3, 31.1, 27.9, 28.4, 25.4, 23.2, 18.2, 14, 12.7, 11, 13.7, 9.7, 12.6, 10.9, 12.7, 13.8, 12.9, 13.8, 10.2, 5.8, 7.6, 8.8, 5.6, 5.6, 6.3, 4.2, 3.6, 5.4, 6.5, 8.1, 10.9, 7.6, 9.7, 10.9, 9.5, 5.4, 4.9, .7, 2.3, 5.5, 10, 10.6, 8.3, 8.4, 8.5, 5.8 ],
        borderWidth: 2,
        fill: true
      }];
    } else {
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


  chartOptions = {

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
          beginAtZero: false,
          // min: 0,
          // max: 40,
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
          beginAtZero: false,
          stepSize: 10,
          fontColor: "#a7afb7",
          padding: 10,
        }
      }],
    },
    // width: 100,
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

  chartColors = [
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
