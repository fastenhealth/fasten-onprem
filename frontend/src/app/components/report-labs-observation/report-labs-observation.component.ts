import {Component, Input, OnInit} from '@angular/core';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {ChartOptions} from 'chart.js';
// import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
// import { BaseChartDirective } from 'ng2-charts';
import * as fhirpath from 'fhirpath';
import {formatDate} from '@angular/common';


@Component({
  selector: 'app-report-labs-observation',
  templateUrl: './report-labs-observation.component.html',
  styleUrls: ['./report-labs-observation.component.scss']
})
export class ReportLabsObservationComponent implements OnInit {

  @Input() observations: ResourceFhir[]
  @Input() observationCode: string
  @Input() observationTitle: string

  // based on https://stackoverflow.com/questions/38889716/chartjs-2-stacked-bar-with-marker-on-top
  // https://stackoverflow.com/questions/62711919/chart-js-horizontal-lines-per-bar


  chartHeight = 45

  barChartData =[
    // {
    //   label: "Current",
    //   backgroundColor: 'rgba(255, 0, 128, 1)',
    //   data: [],
    //   xAxisID: "x-axis-current"
    // },
    // {
    //   label: "Reference",
    //   backgroundColor: 'rgba(99,189,50,0.2)',
    //   data: [],
    //   xAxisID: "x-axis-ref"
    // },



    {
      label: "Reference",
      data: [[55,102], [44,120]],
      backgroundColor: "rgba(91, 71, 251,0.6)",
      hoverBackgroundColor: "rgba(91, 71, 251,0.2)"
    },{
      label: "Current",
      data: [[80,81], [130,131]],
      borderColor: "rgba(0,0,0,1)",
      backgroundColor: "rgba(0,0,0,1)",
      hoverBackgroundColor: "rgba(0,0,0,1)",
      minBarLength: 3,
      barPercentage: 1,
      tooltip: {

      }
      // id: "x-axis-current",
      //important settings

      //set the width of the line ( or point )
      // pointRadius: 50,
      // don´t show line betrween points
      // showLine: false,
      //change points of line chart to line style ( little bit confusin why it´s named point anyway )
      // pointStyle: 'line',

      //chart type
      // type: "line",
    }
  ]

  barChartLabels = [] // ["2020", "2018"] //["1","2","3","4","5","6","7","8"]

  barChartOptions = {
    legend:{
      display: false,
    },
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
      yAxes: [{
        stacked: true,
        ticks: {
          beginAtZero: true,
          fontSize: 10,
          min: 0,
          // max: 80
        },
      }],
      xAxes: [{
        scaleLabel:{
          display: false,
          labelString: "xaxis",
          padding: 4,
        },
        // stacked: true,
        ticks: {
          beginAtZero: true,
          fontSize: 10,
          min: 0,
          // max: 80
        },

      }],
    }
    //   xAxes: [{
    //     id: "x-axis-current",
    //     stacked: true,
    //     // barPercentage: 0.6,
    //     ticks: {
    //       beginAtZero:true,
    //       fontSize: 11
    //     }
    //   },{
    //     id: "x-axis-ref",
    //     stacked: true,
    //     ticks: {
    //       beginAtZero:true,
    //       fontSize: 11
    //     }
    //     // offset: true,
    //
    //     // display: false,
    //     // gridLines: {
    //     //   offsetGridLines: true
    //     // }
    //   }]
    // },
    // legend: {
    //   display: false
    // },
    // elements: {
    //   point: {
    //     radius: 0
    //   }
    // }
  } as ChartOptions

  barChartColors = [
    {
      backgroundColor: 'white'
    }
  ];


  constructor() { }

  ngOnInit(): void {

    let currentValues = []

    let referenceRanges = []

    //sort observations
    this.observations = this.observations.sort((a, b) => a.sort_date > b.sort_date ? -1 : a.sort_date < b.sort_date ? 1 : 0)


    for(let observation of this.observations){
      //get label
      this.barChartLabels.push(
        formatDate(fhirpath.evaluate(observation.resource_raw, "Observation.effectiveDateTime")[0], "mediumDate", "en-US", undefined)
      )

      //get current value
      currentValues.push(fhirpath.evaluate(observation.resource_raw, "Observation.valueQuantity.value")[0])

      //set chart x-axis label
      let units = fhirpath.evaluate(observation.resource_raw, "Observation.valueQuantity.unit")[0]
      if(units){
        this.barChartOptions.scales.xAxes[0].scaleLabel.display = true
        this.barChartOptions.scales.xAxes[0].scaleLabel.labelString = units
      }


      //add low/high ref value blocks
      referenceRanges.push([
        fhirpath.evaluate(observation.resource_raw, "Observation.referenceRange.low.value")[0],
        fhirpath.evaluate(observation.resource_raw, "Observation.referenceRange.high.value")[0]
      ])
    }

    // @ts-ignore
    this.barChartData[0].data = referenceRanges
    this.barChartData[1].data = currentValues.map(v => [v, v])

    if(currentValues.length > 1){
      this.chartHeight = 30 * currentValues.length
    }
  }

}
