import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FhirCardEditableComponentInterface} from '../../fhir-card/fhir-card-component-interface';
import {ImmunizationModel} from '../../../../../lib/models/resources/immunization-model';
import {TableRowItem} from '../../common/table/table-row-item';
import {Router, RouterModule} from '@angular/router';
import {PractitionerModel} from '../../../../../lib/models/resources/practitioner-model';
import {NgbCollapseModule} from "@ng-bootstrap/ng-bootstrap";
import {CommonModule} from "@angular/common";
import {BadgeComponent} from "../../common/badge/badge.component";
import {TableComponent} from "../../common/table/table.component";
import { FastenDisplayModel } from 'src/lib/models/fasten/fasten-display-model';

@Component({
  standalone: true,
  imports: [NgbCollapseModule, CommonModule, BadgeComponent, TableComponent, RouterModule],
  selector: 'fhir-practitioner',
  templateUrl: './practitioner.component.html',
  styleUrls: ['./practitioner.component.scss']
})
export class PractitionerComponent implements OnInit, FhirCardEditableComponentInterface {
  @Input() displayModel: PractitionerModel | null
  @Input() showDetails: boolean = true
  @Input() isCollapsed: boolean = false
  @Input() isEditable: boolean = false
    
  @Output() unlinkRequested: EventEmitter<FastenDisplayModel> = new EventEmitter<FastenDisplayModel>()
  @Output() editRequested: EventEmitter<FastenDisplayModel> = new EventEmitter<FastenDisplayModel>()

  tableData: TableRowItem[] = []

  constructor(public changeRef: ChangeDetectorRef, public router: Router) {}

  ngOnInit(): void {
    this.tableData = [
    {
      label: 'Gender',
      data: this.displayModel?.gender,
      enabled: !!this.displayModel?.gender,
    },
    // {
    //   label: 'Birth date',
    //   data: birthDate && <Date fhirData={birthDate} isBlack />,
    //   status: birthDate,
    // },
    // {
    //   label: 'Contact',
    //   data: isContactData && (
    //   <PatientContact
    //     name={contactData.name}
    //   relationship={contactData.relationship}
    //   />
    // ),
    //   status: isContactData,
    // },
  ];
    for(let idCoding of (this.displayModel?.identifier || [])){
      this.tableData.push({
        label: `Identifier (${idCoding.system})`,
        data: idCoding.display || idCoding.value,
        enabled: true,
      })
    }
    if(this.displayModel?.address?.length > 0){
      let address = this.displayModel?.address?.[0]
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
    for(let telecom of (this.displayModel?.telecom || [])){
      this.tableData.push({
        label: telecom.system,
        data: telecom.value,
        enabled: !!telecom.value,
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
