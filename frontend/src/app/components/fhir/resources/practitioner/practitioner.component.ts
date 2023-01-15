import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {FhirResourceComponentInterface} from '../../fhir-resource/fhir-resource-component-interface';
import {ImmunizationModel} from '../../../../../lib/models/resources/immunization-model';
import {TableRowItem} from '../../common/table/table-row-item';
import {Router} from '@angular/router';
import {PractitionerModel} from '../../../../../lib/models/resources/practitioner-model';

@Component({
  selector: 'app-practitioner',
  templateUrl: './practitioner.component.html',
  styleUrls: ['./practitioner.component.scss']
})
export class PractitionerComponent implements OnInit, FhirResourceComponentInterface {
  @Input() displayModel: PractitionerModel
  @Input() showDetails: boolean = true

  isCollapsed: boolean = false

  tableData: TableRowItem[] = []

  constructor(public changeRef: ChangeDetectorRef, public router: Router) {}

  ngOnInit(): void {

    this.tableData = [
      // {
      //   label: 'Identifiers',
      //   testId: 'identifier',
      //   data: identifier && <Identifier fhirData={identifier} />,
      //     status: identifier,
      // },
    {
      label: 'Gender',
      data: this.displayModel.gender,
      enabled: !!this.displayModel.gender,
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
    //     testId: 'address',
    //   data: address && <Address fhirData={address} />,
    //   status: address,
    // },
    // {
    //   label: 'Telephone',
    //     testId: 'telecom',
    //   data: telecom && <Telecom fhirData={telecom} />,
    //   status: telecom,
    // },
  ];

  }
  markForCheck(){
    this.changeRef.markForCheck()
  }
}
