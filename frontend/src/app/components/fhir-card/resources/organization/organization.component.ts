import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgbCollapseModule} from '@ng-bootstrap/ng-bootstrap';
import {CommonModule} from '@angular/common';
import {BadgeComponent} from '../../common/badge/badge.component';
import {TableComponent} from '../../common/table/table.component';
import {Router, RouterModule} from '@angular/router';
import {LocationModel} from '../../../../../lib/models/resources/location-model';
import {TableRowItem, TableRowItemDataType} from '../../common/table/table-row-item';
import {OrganizationModel} from '../../../../../lib/models/resources/organization-model';
import { FhirCardEditableComponentInterface } from '../../fhir-card/fhir-card-component-interface';
import { FastenDisplayModel } from 'src/lib/models/fasten/fasten-display-model';

@Component({
  standalone: true,
  imports: [NgbCollapseModule, CommonModule, BadgeComponent, TableComponent, RouterModule],
  selector: 'fhir-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit, FhirCardEditableComponentInterface {
  @Input() displayModel: OrganizationModel
  @Input() showDetails: boolean = true
  @Input() isCollapsed: boolean = false
  @Input() isEditable: boolean = false

  @Output() unlinkRequested: EventEmitter<FastenDisplayModel> = new EventEmitter<FastenDisplayModel>()
  @Output() editRequested: EventEmitter<FastenDisplayModel> = new EventEmitter<FastenDisplayModel>()

  tableData: TableRowItem[] = []

  constructor(public changeRef: ChangeDetectorRef, public router: Router) { }

  ngOnInit(): void {

    for(let idCoding of (this.displayModel?.identifier || [])){
      this.tableData.push({
        label: `Identifier (${idCoding.system})`,
        data: idCoding.display || idCoding.value,
        enabled: true,
      })
    }

    for(let address of (this.displayModel?.addresses || [])){
      let addressParts = []
      if(address.line){
        addressParts.push(address.line.join(' '))
      }
      if(address.city){
        addressParts.push(address.city)
      }
      if(address.state){
        addressParts.push(address.state)
      }
      if(address.postalCode){
        addressParts.push(address.postalCode)
      }

      this.tableData.push({
        label: 'Address',
        data: addressParts.join(", "),
        enabled: !!addressParts,
      })
    }

    this.tableData.push(    {
        label: 'Contacts',
        data: this.displayModel?.telecom,
        data_type: TableRowItemDataType.CodingList,
        enabled: !!this.displayModel?.telecom,
      },
      {
        label: 'Type',
        data: this.displayModel?.type_codings,
        data_type: TableRowItemDataType.CodableConcept,
        enabled: !!this.displayModel?.type_codings && this.displayModel.type_codings.length > 0,
      })

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
