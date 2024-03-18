import { Component, Input, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { ObservationModel } from '../../../../../lib/models/resources/observation-model';
import { ChartConfiguration } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

const defaultChartHeight = 65;
const defaultChartEntryHeight = 30;

@Component({
  standalone: true,
  selector: 'observation-bar-chart',
  imports: [ NgChartsModule ],
  templateUrl: './observation-bar-chart.component.html',
  styleUrls: ['./observation-bar-chart.component.scss']
})
export class ObservationBarChartComponent implements OnInit {
  @Input() observations: ObservationModel[]

  chartHeight = defaultChartEntryHeight;

  // based on https://stackoverflow.com/questions/38889716/chartjs-2-stacked-bar-with-marker-on-top
  // https://stackoverflow.com/questions/62711919/chart-js-horizontal-lines-per-bar
  barChartData =[
    {
      label: "Reference",
      data: [],
      dataLabels: [],
      backgroundColor: "rgba(91, 71, 251,0.6)",
      hoverBackgroundColor: "rgba(91, 71, 251,0.2)",
      parsing: {
        xAxisKey: 'range'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.dataset.dataLabels[context.dataIndex]}`;
          }
        }
      }
    },
    {
      label: "Result",
      data: [],
      // @ts-ignore
      dataLabels: [],
      borderColor: "rgba(0,0,0,1)",
      backgroundColor: "rgba(0,0,0,1)",
      hoverBackgroundColor: "rgba(0,0,0,1)",
      minBarLength: 3,
      barPercentage: 1,
      parsing: {
        xAxisKey: 'value'
      },
      // @ts-ignore
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = `${context.dataset.label}: ${context.parsed.x}`;

            if (context.dataset.dataLabels[context.dataIndex]) {
              return `${label} ${context.dataset.dataLabels[context.dataIndex]}`;
            }
            return label;
          }
        }
      }
    }
  ]  as ChartConfiguration<'bar'>['data']['datasets']

  barChartLabels = [] // ["2020", "2018"] //["1","2","3","4","5","6","7","8"]

  barChartOptions = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    legend:{
      display: false,
    },
    autoPadding: true,
    //add padding to fix tooltip cutoff
    layout: {
      padding: {
        left: 0,
        right: 4,
        top: 0,
        bottom: 10
      }
    },
    scales: {
      y: {
        stacked: true,
        ticks: {
          beginAtZero: true,
          fontSize: 10,
          min: 0,
        },
      },
      x: {
        scaleLabel:{
          display: false,
          padding: 4,
        },
        ticks: {
          beginAtZero: true,
          fontSize: 10,
          min: 0,
        },
      },
    }
  } as ChartConfiguration<'bar'>['options']

  barChartColors = [
    {
      backgroundColor: 'white'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    if(!this.observations || !this.observations[0]) {
      return;
    }

    let currentValues = []
    let referenceRanges = []

    for(let observation of this.observations) {
      let refRange = observation.reference_range;

      referenceRanges.push([refRange.low || 0, refRange.high || 0]);

      let value = observation.value_object;

      if (value.range) {
        currentValues.push([value.range.low, value.range.high]);
      } else {
        currentValues.push([value.value, value.value])
      }

      if (observation.effective_date) {
        this.barChartLabels.push(formatDate(observation.effective_date, "mediumDate", "en-US", undefined));
      } else {
        this.barChartLabels.push('Unknown date');
      }

      this.barChartData[0]['dataLabels'].push(observation.referenceRangeDisplay());
      this.barChartData[1]['dataLabels'].push(observation.value_quantity_unit);
    }

    let xAxisMax = Math.max(...currentValues.map(set => set[1])) * 1.3;
    this.barChartOptions.scales['x']['max'] = xAxisMax

    let updatedRefRanges = referenceRanges.map(range => {
      if (range[0] && !range[1]) {
        return [range[0], xAxisMax]
      } else {
        return [range[0], range[1]]
      }
    });

    // @ts-ignore
    this.barChartData[0].data = updatedRefRanges
    this.barChartData[1].data = currentValues

    this.chartHeight = defaultChartHeight + (defaultChartEntryHeight * currentValues.length)
  }
}
