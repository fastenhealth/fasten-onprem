import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FhirCardEditableComponentInterface} from '../../fhir-card/fhir-card-component-interface';
import {TableRowItem, TableRowItemDataType} from '../../common/table/table-row-item';
import {Router, RouterModule} from '@angular/router';
import {ProcedureModel} from '../../../../../lib/models/resources/procedure-model';
import {NgbCollapseModule} from "@ng-bootstrap/ng-bootstrap";
import {CommonModule} from "@angular/common";
import {BadgeComponent} from "../../common/badge/badge.component";
import {TableComponent} from "../../common/table/table.component";
import {GlossaryLookupComponent} from '../../../glossary-lookup/glossary-lookup.component';
import { FastenDisplayModel } from 'src/lib/models/fasten/fasten-display-model';

@Component({
  standalone: true,
  imports: [NgbCollapseModule, CommonModule, BadgeComponent, TableComponent, GlossaryLookupComponent, RouterModule],
  selector: 'fhir-procedure',
  templateUrl: './procedure.component.html',
  styleUrls: ['./procedure.component.scss']
})
export class ProcedureComponent implements OnInit, FhirCardEditableComponentInterface {
  @Input() displayModel: ProcedureModel | null
  @Input() showDetails: boolean = true
  @Input() isCollapsed: boolean = false
  @Input() isEditable: boolean = false
  
  @Output() unlinkRequested: EventEmitter<FastenDisplayModel> = new EventEmitter<FastenDisplayModel>()
  @Output() editRequested: EventEmitter<FastenDisplayModel> = new EventEmitter<FastenDisplayModel>()

  //these are used to populate the description of the resource. May not be available for all resources
  resourceCode?: string;
  resourceCodeSystem?: string;

  tableData: TableRowItem[] = []

  constructor(public changeRef: ChangeDetectorRef, public router: Router) {}

  ngOnInit(): void {

    //medline only supports CPT procedure codes - "http://www.ama-assn.org/go/cpt", "2.16.840.1.113883.6.12"
    for(let coding of this.displayModel?.coding ?? []){
      if(coding.system == "http://www.ama-assn.org/go/cpt" ||  coding.system == "2.16.840.1.113883.6.12"){
        this.resourceCode = coding.code
        this.resourceCodeSystem = coding.system
        break
      }
    }

    this.tableData = [
      {
        label: 'Identification',
        data: this.displayModel?.coding,
        data_type: TableRowItemDataType.CodingList,
        enabled: this.displayModel?.has_coding,
      },
    {
      label: 'Category',
      data: this.displayModel?.category,
      data_type: TableRowItemDataType.Coding,
      enabled: !!this.displayModel?.category,
    },
    {
      label: 'Performed by',
      data: this.displayModel?.performer,
      enabled: this.displayModel?.has_performer_data,
    },
    // {
    //   label: 'Reason procedure performed',
    //   data: reasonCode && <Annotation fhirData={reasonCode} />,
    //   status: hasReasonCode,
    // },
    {
      label: 'Location',
      data: this.displayModel?.location_reference,
      data_type: TableRowItemDataType.Reference,
      enabled: !!this.displayModel?.location_reference,
    },
    // {
    //   label: 'Additional information about the procedure',
    //   data: note && <Annotation fhirData={note} />,
    //   status: hasNote,
    // },
    {
      label: 'The result of procedure',
      data: this.displayModel?.outcome,
      data_type: TableRowItemDataType.Coding,
      enabled: !!this.displayModel?.outcome,
    },
  ];

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
