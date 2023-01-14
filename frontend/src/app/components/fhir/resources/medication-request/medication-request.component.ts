import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {FhirResourceComponentInterface} from '../../fhir-resource/fhir-resource-component-interface';
import {TableRowItem, TableRowItemDataType} from '../../common/table/table-row-item';
import {Router} from '@angular/router';
import {MedicationRequestModel} from '../../../../../lib/models/resources/medication-request-model';

@Component({
  selector: 'fhir-medication-request',
  templateUrl: './medication-request.component.html',
  styleUrls: ['./medication-request.component.scss']
})
export class MedicationRequestComponent implements OnInit, FhirResourceComponentInterface {
  @Input() displayModel: MedicationRequestModel
  isCollapsed: boolean = false

  tableData: TableRowItem[] = []

  constructor(public changeRef: ChangeDetectorRef, public router: Router) {}

  ngOnInit(): void {

    this.tableData = [
      {
        label: 'Medication',
        data: this.displayModel.medication_codeable_concept,
        data_type: TableRowItemDataType.Coding,
        enabled: !!this.displayModel.medication_codeable_concept,
      },
      {
        label: 'Requester',
        data: this.displayModel.requester,
        data_type: TableRowItemDataType.Reference,
        enabled: !!this.displayModel.requester,
      },
      {
        label: 'Created',
        data: this.displayModel.created,
        enabled: !!this.displayModel.created,
      },
      {
        label: 'Type of request',
        data: this.displayModel.intent,
        enabled: !!this.displayModel.intent,
      },
      {
        label: 'Reason',
        data: this.displayModel.reason_code,
        data_type: TableRowItemDataType.Coding,
        enabled: !!this.displayModel.reason_code,
      },
      // {
      //   label: 'Dosage',
      //     testId: 'hasDosageInstruction',
      //   data:
      //   hasDosageInstruction &&
      //   dosageInstruction.map((item, i) => (
      //     <p key={`dosage-instruction-item-${i}`}>{item.text}</p>
      // )),
      //   status: hasDosageInstruction,
      // },
    ];
  }
  markForCheck(){
    this.changeRef.markForCheck()
  }
}
