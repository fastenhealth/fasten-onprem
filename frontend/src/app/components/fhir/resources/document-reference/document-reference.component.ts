import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {DiagnosticReportModel} from '../../../../../lib/models/resources/diagnostic-report-model';
import {TableRowItem, TableRowItemDataType} from '../../common/table/table-row-item';
import {Router} from '@angular/router';
import {DocumentReferenceModel} from '../../../../../lib/models/resources/document-reference-model';
import {FhirResourceComponentInterface} from '../../fhir-resource/fhir-resource-component-interface';

@Component({
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
        data: this.displayModel?.category?.coding,
        data_type: TableRowItemDataType.CodingList,
        enabled: !!this.displayModel?.category,
      },
      // {
      //   label: 'Performer',
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
