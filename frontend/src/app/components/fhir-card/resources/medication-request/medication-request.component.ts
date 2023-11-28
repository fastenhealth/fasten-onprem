import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {FhirCardComponentInterface} from '../../fhir-card/fhir-card-component-interface';
import {TableRowItem, TableRowItemDataType} from '../../common/table/table-row-item';
import {Router, RouterModule} from '@angular/router';
import {MedicationRequestModel} from '../../../../../lib/models/resources/medication-request-model';
import {NgbCollapseModule} from "@ng-bootstrap/ng-bootstrap";
import {CommonModule} from "@angular/common";
import {BadgeComponent} from "../../common/badge/badge.component";
import {TableComponent} from "../../common/table/table.component";
import {GlossaryLookupComponent} from '../../../glossary-lookup/glossary-lookup.component';

@Component({
  standalone: true,
  imports: [NgbCollapseModule, CommonModule, BadgeComponent, TableComponent, GlossaryLookupComponent, RouterModule],
  selector: 'fhir-medication-request',
  templateUrl: './medication-request.component.html',
  styleUrls: ['./medication-request.component.scss']
})
export class MedicationRequestComponent implements OnInit, FhirCardComponentInterface {
  @Input() displayModel: MedicationRequestModel | null
  @Input() showDetails: boolean = true
  //these are used to populate the description of the resource. May not be available for all resources
  resourceCode?: string;
  resourceCodeSystem?: string;

  isCollapsed: boolean = false

  tableData: TableRowItem[] = []

  constructor(public changeRef: ChangeDetectorRef, public router: Router) {}

  ngOnInit(): void {

    this.resourceCode = this.displayModel?.medication_codeable_concept?.code
    this.resourceCodeSystem = this.displayModel?.medication_codeable_concept?.system

    this.tableData = [
      {
        label: 'Medication',
        data: this.displayModel?.medication_codeable_concept,
        data_type: TableRowItemDataType.Coding,
        enabled: !!this.displayModel?.medication_codeable_concept,
      },
      {
        label: 'Requester',
        data: this.displayModel?.requester,
        data_type: TableRowItemDataType.Reference,
        enabled: !!this.displayModel?.requester,
      },
      {
        label: 'Created',
        data: this.displayModel?.created,
        enabled: !!this.displayModel?.created,
      },
      {
        label: 'Type of request',
        data: this.displayModel?.intent,
        enabled: !!this.displayModel?.intent,
      },
      {
        label: 'Reason',
        data: this.displayModel?.reason_code,
        data_type: TableRowItemDataType.Coding,
        enabled: !!this.displayModel?.reason_code,
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
