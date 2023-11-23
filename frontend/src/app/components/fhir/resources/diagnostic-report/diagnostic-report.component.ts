import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {FhirResourceComponentInterface} from '../../fhir-resource/fhir-resource-component-interface';
import {TableRowItem, TableRowItemDataType} from '../../common/table/table-row-item';
import {Router} from '@angular/router';
import {DiagnosticReportModel} from '../../../../../lib/models/resources/diagnostic-report-model';

@Component({
  selector: 'app-diagnostic-report',
  templateUrl: './diagnostic-report.component.html',
  styleUrls: ['./diagnostic-report.component.scss']
})
export class DiagnosticReportComponent implements OnInit, FhirResourceComponentInterface {
  @Input() displayModel: DiagnosticReportModel
  @Input() showDetails: boolean = true
  //these are used to populate the description of the resource. May not be available for all resources
  resourceCode?: string;
  resourceCodeSystem?: string;

  isCollapsed: boolean = false
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
}
