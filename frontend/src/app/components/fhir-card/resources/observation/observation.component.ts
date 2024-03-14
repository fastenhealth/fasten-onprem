import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import {CommonModule} from '@angular/common';
import {BadgeComponent} from '../../common/badge/badge.component';
import {TableComponent} from '../../common/table/table.component';
import {Router, RouterModule} from '@angular/router';
import {TableRowItem, TableRowItemDataType} from '../../common/table/table-row-item';
import {ObservationModel} from '../../../../../lib/models/resources/observation-model';
import { ObservationBarChartComponent } from 'src/app/components/fhir-card/common/observation-bar-chart/observation-bar-chart.component';

@Component({
  standalone: true,
  imports: [CommonModule, BadgeComponent, TableComponent, RouterModule, NgbCollapseModule, ObservationBarChartComponent],
  providers: [],
  selector: 'fhir-observation',
  templateUrl: './observation.component.html',
  styleUrls: ['./observation.component.scss']
})
export class ObservationComponent implements OnInit {
  @Input() displayModel: ObservationModel
  @Input() showDetails: boolean = true
  @Input() isCollapsed: boolean = false

  tableData: TableRowItem[] = []

  constructor(public changeRef: ChangeDetectorRef, public router: Router) { }

  ngOnInit(): void {
    if(!this.displayModel){
      return
    }

    this.tableData.push(
      {
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
        data: this.displayModel.referenceRangeDisplay(),
        enabled: !!this.displayModel?.reference_range,
      }
    )
  }

  markForCheck(){
    this.changeRef.markForCheck()
  }
}
