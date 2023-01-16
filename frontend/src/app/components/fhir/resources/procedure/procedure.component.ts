import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {FhirResourceComponentInterface} from '../../fhir-resource/fhir-resource-component-interface';
import {TableRowItem, TableRowItemDataType} from '../../common/table/table-row-item';
import {Router} from '@angular/router';
import {ProcedureModel} from '../../../../../lib/models/resources/procedure-model';

@Component({
  selector: 'fhir-procedure',
  templateUrl: './procedure.component.html',
  styleUrls: ['./procedure.component.scss']
})
export class ProcedureComponent implements OnInit, FhirResourceComponentInterface {
  @Input() displayModel: ProcedureModel
  @Input() showDetails: boolean = true
  isCollapsed: boolean = false

  tableData: TableRowItem[] = []

  constructor(public changeRef: ChangeDetectorRef, public router: Router) {}

  ngOnInit(): void {

    this.tableData = [
      {
        label: 'Identification',
        data: this.displayModel.coding,
        data_type: TableRowItemDataType.CodingList,
        enabled: this.displayModel.has_coding,
      },
    {
      label: 'Category',
      data: this.displayModel.category,
      data_type: TableRowItemDataType.Coding,
      enabled: !!this.displayModel.category,
    },
    {
      label: 'Performed by',
      data: this.displayModel.performer,
      enabled: this.displayModel.has_performer_data,
    },
    // {
    //   label: 'Reason procedure performed',
    //   data: reasonCode && <Annotation fhirData={reasonCode} />,
    //   status: hasReasonCode,
    // },
    {
      label: 'Location',
      data: this.displayModel.location_reference,
      data_type: TableRowItemDataType.Reference,
      enabled: !!this.displayModel.location_reference,
    },
    // {
    //   label: 'Additional information about the procedure',
    //   data: note && <Annotation fhirData={note} />,
    //   status: hasNote,
    // },
    {
      label: 'The result of procedure',
      data: this.displayModel.outcome,
      data_type: TableRowItemDataType.Coding,
      enabled: !!this.displayModel.outcome,
    },
  ];

  }
  markForCheck(){
    this.changeRef.markForCheck()
  }
}
