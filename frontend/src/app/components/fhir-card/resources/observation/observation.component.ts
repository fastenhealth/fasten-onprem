import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import {CommonModule} from '@angular/common';
import {BadgeComponent} from '../../common/badge/badge.component';
import {TableComponent} from '../../common/table/table.component';
import {Router, RouterModule} from '@angular/router';
import {TableRowItem, TableRowItemDataType} from '../../common/table/table-row-item';
import {ObservationModel} from '../../../../../lib/models/resources/observation-model';
import { ObservationVisualizationComponent } from '../../common/observation-visualization/observation-visualization.component';

@Component({
  standalone: true,
  imports: [CommonModule, BadgeComponent, TableComponent, RouterModule, NgbCollapseModule, ObservationVisualizationComponent],
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
  displayVisualization: boolean = true

  constructor(public changeRef: ChangeDetectorRef, public router: Router) { }

  ngOnInit(): void {
    if(!this.displayModel){
      return
    }

    let visualizationTypes = this.displayModel?.value_model?.visualizationTypes()

    // If only table is allowed, just don't display anything since we are already displaying
    // everything in tabular format.
    if (visualizationTypes.length == 1 && visualizationTypes[0] == 'table') {
      this.displayVisualization = false
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
        enabled: !!this.displayModel?.subject,
      },
      {
        label: 'Coding',
        data: this.displayModel?.code,
        data_type: TableRowItemDataType.CodableConcept,
        enabled: !!this.displayModel?.code,
      },
      {
        label: 'Value',
        data: this.displayModel?.value_model?.display(),
        enabled: !!this.displayModel?.value_model,
      },
      {
        label: 'Reference',
        data: this.displayModel?.reference_range.display(),
        enabled: !!this.displayModel?.reference_range.hasValue(),
      }
    )
  }

  markForCheck(){
    this.changeRef.markForCheck()
  }
}
