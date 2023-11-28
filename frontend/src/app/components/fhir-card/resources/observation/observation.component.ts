import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {NgbCollapseModule} from '@ng-bootstrap/ng-bootstrap';
import {CommonModule, formatDate} from '@angular/common';
import {BadgeComponent} from '../../common/badge/badge.component';
import {TableComponent} from '../../common/table/table.component';
import {Router, RouterModule} from '@angular/router';
import {LocationModel} from '../../../../../lib/models/resources/location-model';
import {TableRowItem, TableRowItemDataType} from '../../common/table/table-row-item';
import {ObservationModel} from '../../../../../lib/models/resources/observation-model';
import {ChartConfiguration} from 'chart.js';
import fhirpath from 'fhirpath';
import {NgChartsModule} from 'ng2-charts';

@Component({
  standalone: true,
  imports: [NgbCollapseModule, CommonModule, BadgeComponent, TableComponent, RouterModule, NgChartsModule],
  selector: 'fhir-observation',
  templateUrl: './observation.component.html',
  styleUrls: ['./observation.component.scss']
})
export class ObservationComponent implements OnInit {
  @Input() displayModel: ObservationModel
  @Input() showDetails: boolean = true

  isCollapsed: boolean = false
  tableData: TableRowItem[] = []

  //observation chart data
  chartHeight = 45

  barChartData =[

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
    }
  ]  as ChartConfiguration<'bar'>['data']['datasets']

  barChartLabels = [] // ["2020", "2018"] //["1","2","3","4","5","6","7","8"]

  barChartOptions = {
    indexAxis: 'y',
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
          // max: 80
        },
      },
      x: {
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
      },
    }
  } as ChartConfiguration<'bar'>['options']

  barChartColors = [
    {
      backgroundColor: 'white'
    }
  ];


  constructor(public changeRef: ChangeDetectorRef, public router: Router) { }

  ngOnInit(): void {

    this.tableData.push(    {
        label: 'Issued on',
        data: this.displayModel?.effective_date,
        enabled: !!this.displayModel?.effective_date,
      },
      {
        label: 'Subject',
        data: this.displayModel?.subject,
        data_type: TableRowItemDataType.Reference,
        enabled: !!this.displayModel?.subject ,
      },
      {
        label: 'Coding',
        data: this.displayModel?.code,
        data_type: TableRowItemDataType.Coding,
        enabled: !!this.displayModel?.code,
      },
      {
        label: 'Value',
        data: [this.displayModel?.value_quantity_value,this.displayModel?.value_quantity_unit].join(" "),
        enabled: !!this.displayModel?.value_quantity_value,
      },
      {
        label: 'Reference',
        data: [this.displayModel?.reference_range?.[0]?.low?.value,this.displayModel?.reference_range?.[0]?.high?.value].join(" "),
        enabled: !!this.displayModel?.reference_range,
      })


    //populate chart data

    this.barChartLabels.push(
      formatDate(this.displayModel.effective_date, "mediumDate", "en-US", undefined)
    )

    this.barChartData[0].data = [[this.displayModel.reference_range?.[0]?.low?.value, this.displayModel.reference_range?.[0]?.high?.value]]
    this.barChartData[1].data = [[this.displayModel.value_quantity_value as number, this.displayModel.value_quantity_value as number]]

    let suggestedMax = (this.displayModel.value_quantity_value as number) * 1.1;
    this.barChartOptions.scales['x']['suggestedMax'] = suggestedMax

    console.log("Observation chart data: ", this.barChartData[0].data, this.barChartData[1].data)
  }
  markForCheck(){
    this.changeRef.markForCheck()
  }

}
