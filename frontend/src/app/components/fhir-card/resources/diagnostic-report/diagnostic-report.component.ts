import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FhirCardEditableComponentInterface} from '../../fhir-card/fhir-card-component-interface';
import {TableRowItem, TableRowItemDataType} from '../../common/table/table-row-item';
import {Router, RouterModule} from '@angular/router';
import {DiagnosticReportModel} from '../../../../../lib/models/resources/diagnostic-report-model';
import {NgbCollapseModule, NgbNavModule} from '@ng-bootstrap/ng-bootstrap';
import {CommonModule} from '@angular/common';
import {BadgeComponent} from '../../common/badge/badge.component';
import {TableComponent} from '../../common/table/table.component';
import {BinaryComponent} from '../binary/binary.component';
import {GlossaryLookupComponent} from '../../../glossary-lookup/glossary-lookup.component';
import { FastenDisplayModel } from 'src/lib/models/fasten/fasten-display-model';

@Component({
  standalone: true,
  imports: [NgbCollapseModule, NgbNavModule, CommonModule, BadgeComponent, TableComponent, RouterModule, BinaryComponent, GlossaryLookupComponent],
  selector: 'fhir-diagnostic-report',
  templateUrl: './diagnostic-report.component.html',
  styleUrls: ['./diagnostic-report.component.scss']
})
export class DiagnosticReportComponent implements OnInit, FhirCardEditableComponentInterface {
  @Input() displayModel: DiagnosticReportModel
  @Input() showDetails: boolean = true
  @Input() isCollapsed: boolean = false
  @Input() isEditable: boolean = false

  @Output() unlinkRequested: EventEmitter<FastenDisplayModel> = new EventEmitter<FastenDisplayModel>()
  @Output() editRequested: EventEmitter<FastenDisplayModel> = new EventEmitter<FastenDisplayModel>()

  active: number = 0

  //these are used to populate the description of the resource. May not be available for all resources
  resourceCode?: string;
  resourceCodeSystem?: string;

  tableData: TableRowItem[] = []

  constructor(public changeRef: ChangeDetectorRef, public router: Router) {}


  ngOnInit(): void {
    this.resourceCode = this.displayModel?.code_coding?.[0]?.code
    this.resourceCodeSystem = this.displayModel?.code_coding?.[0]?.system

    this.tableData = [
      {
        label: 'Issued',
        data: this.displayModel?.issued,
        enabled: !!this.displayModel?.issued,
      },
      // {
      //   label: 'Category',
      //   data: this.displayModel?.category_coding,
      //   data_type: TableRowItemDataType.CodingList,
      //   enabled: this.displayModel?.has_category_coding,
      // },
      {
        label: 'Performer',
        data: this.displayModel?.performer,
        data_type: TableRowItemDataType.Reference,
        enabled: this.displayModel?.has_performer,
      },
      {
        label: 'Conclusion',
        data: this.displayModel?.conclusion,
        enabled: !!this.displayModel?.conclusion,
      },
    ];

    for(let categoryCodeable of (this.displayModel?.category_coding || [])){
      this.tableData.push({
        label: `Category`,
        data_type: TableRowItemDataType.CodableConcept,
        data: categoryCodeable,
        enabled: true,
      })
    }
  }
  markForCheck(){
    this.changeRef.markForCheck()
  }

  onUnlinkClicked() {
    this.unlinkRequested.emit(this.displayModel)
  }

  onEditClicked() {
    this.editRequested.emit(this.displayModel)
  }
}
