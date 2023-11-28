import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {DiagnosticReportModel} from '../../../../../lib/models/resources/diagnostic-report-model';
import {TableRowItem, TableRowItemDataType} from '../../common/table/table-row-item';
import {Router, RouterModule} from '@angular/router';
import {DocumentReferenceModel} from '../../../../../lib/models/resources/document-reference-model';
import {FhirResourceComponentInterface} from '../../fhir-resource/fhir-resource-component-interface';
import {NgbCollapseModule} from '@ng-bootstrap/ng-bootstrap';
import {CommonModule} from '@angular/common';
import {BadgeComponent} from '../../common/badge/badge.component';
import {TableComponent} from '../../common/table/table.component';
import {BinaryComponent} from '../binary/binary.component';
import {GlossaryLookupComponent} from '../../../glossary-lookup/glossary-lookup.component';

@Component({
  standalone: true,
  imports: [NgbCollapseModule, CommonModule, BadgeComponent, TableComponent, RouterModule, BinaryComponent],
  selector: 'app-document-reference',
  templateUrl: './document-reference.component.html',
  styleUrls: ['./document-reference.component.scss']
})
export class DocumentReferenceComponent implements OnInit, FhirResourceComponentInterface {
  @Input() displayModel: DocumentReferenceModel
  @Input() showDetails: boolean = true
  isCollapsed: boolean = false
  tableData: TableRowItem[] = []

  constructor(public changeRef: ChangeDetectorRef, public router: Router) {}


  ngOnInit(): void {
    this.tableData = [
      {
        label: 'Description',
        data: this.displayModel?.description,
        enabled: !!this.displayModel?.description,
      },
      {
        label: 'Category',
        data: this.displayModel?.category,
        data_type: TableRowItemDataType.CodableConcept,
        enabled: !!this.displayModel?.category,
      },
      // {
      //   label: 'Author',
      //   data: this.displayModel?.performer,
      //   data_type: TableRowItemDataType.Reference,
      //   enabled: this.displayModel?.has_performer,
      // },
      // {
      //   label: 'Conclusion',
      //   data: this.displayModel?.conclusion,
      //   enabled: !!this.displayModel?.conclusion,
      // },
    ];
  }
  markForCheck(){
    this.changeRef.markForCheck()
  }
}
