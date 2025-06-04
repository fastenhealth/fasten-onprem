import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgbCollapseModule} from '@ng-bootstrap/ng-bootstrap';
import {CommonModule} from '@angular/common';
import {BadgeComponent} from '../../common/badge/badge.component';
import {TableComponent} from '../../common/table/table.component';
import {GlossaryLookupComponent} from '../../../glossary-lookup/glossary-lookup.component';
import {Router, RouterModule} from '@angular/router';
import {TableRowItem, TableRowItemDataType} from '../../common/table/table-row-item';
import {FhirCardEditableComponentInterface} from '../../fhir-card/fhir-card-component-interface';
import {EncounterModel} from '../../../../../lib/models/resources/encounter-model';
import { FastenDisplayModel } from 'src/lib/models/fasten/fasten-display-model';

@Component({
  standalone: true,
  imports: [NgbCollapseModule, CommonModule, BadgeComponent, TableComponent, GlossaryLookupComponent, RouterModule],
  selector: 'fhir-encounter',
  templateUrl: './encounter.component.html',
  styleUrls: ['./encounter.component.scss']
})
export class EncounterComponent implements OnInit, FhirCardEditableComponentInterface {
  @Input() displayModel: EncounterModel | null
  @Input() showDetails: boolean = true
  @Input() isCollapsed: boolean = false
  @Input() isEditable: boolean = false

  @Output() unlinkRequested: EventEmitter<FastenDisplayModel> = new EventEmitter<FastenDisplayModel>()
  @Output() editRequested: EventEmitter<FastenDisplayModel> = new EventEmitter<FastenDisplayModel>()

  //these are used to populate the description of the resource. May not be available for all resources
  resourceCode?: string;
  resourceCodeSystem?: string;

  tableData: TableRowItem[] = []

  constructor(public changeRef: ChangeDetectorRef, public router: Router) { }

  ngOnInit(): void {
    this.tableData = [
      {
        label: 'Type',
        data: this.displayModel?.encounter_type?.[0],
        data_type: TableRowItemDataType.CodableConcept,
        enabled: !!this.displayModel?.encounter_type?.[0],
      },
      {
        label: 'Location',
        data: this.displayModel?.location_display,
        enabled: !!this.displayModel?.location_display,
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
