import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {FhirResourceComponentInterface} from '../../fhir-resource/fhir-resource-component-interface';
import {ImmunizationModel} from '../../../../../lib/models/resources/immunization-model';
import {TableRowItem} from '../../common/table/table-row-item';
import {Router} from '@angular/router';
import {PractitionerModel} from '../../../../../lib/models/resources/practitioner-model';
import {NgbCollapseModule} from "@ng-bootstrap/ng-bootstrap";
import {CommonModule} from "@angular/common";
import {BadgeComponent} from "../../common/badge/badge.component";
import {TableComponent} from "../../common/table/table.component";

@Component({
  standalone: true,
  imports: [NgbCollapseModule, CommonModule, BadgeComponent, TableComponent],
  selector: 'app-practitioner',
  templateUrl: './practitioner.component.html',
  styleUrls: ['./practitioner.component.scss']
})
export class PractitionerComponent implements OnInit, FhirResourceComponentInterface {
  @Input() displayModel: PractitionerModel | null
  @Input() showDetails: boolean = true

  isCollapsed: boolean = false

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
    // {
    //   label: 'Address',
    //   data: this.displayModel?.address.,
    //   status: !!this.displayModel?.address,
    // },
    // {
    //   label: 'Telephone',
    //   data: this.displayModel.telecom,
    //   enabled: !!this.displayModel.telecom,
    // },
  ];
    for(let idCoding of (this.displayModel?.identifier || [])){
      this.tableData.push({
        label: `Identifier (${idCoding.system})`,
        data: idCoding.display || idCoding.value,
        enabled: true,
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
}
