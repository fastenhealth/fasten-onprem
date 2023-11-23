import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {NgbCollapseModule} from '@ng-bootstrap/ng-bootstrap';
import {CommonModule} from '@angular/common';
import {BadgeComponent} from '../../common/badge/badge.component';
import {TableComponent} from '../../common/table/table.component';
import {Router, RouterModule} from '@angular/router';
import {LocationModel} from '../../../../../lib/models/resources/location-model';
import {TableRowItem, TableRowItemDataType} from '../../common/table/table-row-item';
import {ObservationModel} from '../../../../../lib/models/resources/observation-model';

@Component({
  standalone: true,
  imports: [NgbCollapseModule, CommonModule, BadgeComponent, TableComponent, RouterModule],
  selector: 'fhir-observation',
  templateUrl: './observation.component.html',
  styleUrls: ['./observation.component.scss']
})
export class ObservationComponent implements OnInit {
  @Input() displayModel: ObservationModel
  @Input() showDetails: boolean = true

  isCollapsed: boolean = false
  tableData: TableRowItem[] = []

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
      })

  }
  markForCheck(){
    this.changeRef.markForCheck()
  }

}
