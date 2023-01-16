import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {FhirResourceComponentInterface} from '../../fhir-resource/fhir-resource-component-interface';
import {Router} from '@angular/router';
import {ImmunizationModel} from '../../../../../lib/models/resources/immunization-model';
import {TableRowItem, TableRowItemDataType} from '../../common/table/table-row-item';
import * as _ from "lodash";

@Component({
  selector: 'fhir-immunization',
  templateUrl: './immunization.component.html',
  styleUrls: ['./immunization.component.scss']
})
export class ImmunizationComponent implements OnInit, FhirResourceComponentInterface {
  @Input() displayModel: ImmunizationModel
  @Input() showDetails: boolean = true

  isCollapsed: boolean = false

  tableData: TableRowItem[] = []

  constructor(public changeRef: ChangeDetectorRef, public router: Router) {}

  ngOnInit(): void {

    this.tableData.push(    {
        label: 'Manufacturer Text',
        data: this.displayModel?.manufacturer_text,
        enabled: !!this.displayModel?.manufacturer_text,
      },
      {
        label: 'Manufacturer Text',
        data: `${this.displayModel?.lot_number}` + this.displayModel?.lot_number_expiration_date ? ` expires on ${this.displayModel?.lot_number_expiration_date}` : '',
        enabled: this.displayModel?.has_lot_number,
      },
      {
        label: 'Dosage',
        data:
        [
          _.get(this.displayModel?.dose_quantity, 'value'),
          _.get(this.displayModel?.dose_quantity, 'unit') || _.get(this.displayModel?.dose_quantity, 'code'),
        ].join(' '),
        enabled: this.displayModel?.has_dose_quantity,
      },
      {
        label: 'Patient',
        data: this.displayModel?.patient,
        data_type: TableRowItemDataType.Reference,
        enabled: !!this.displayModel?.patient,
      },
    {
      label: 'Requester',
      data: this.displayModel?.requester,
      data_type: TableRowItemDataType.Reference,
      enabled: !!this.displayModel?.requester,
    },
    {
      label: 'Performer',
      data: this.displayModel?.performer,
      data_type: TableRowItemDataType.Reference,
      enabled: !!this.displayModel?.performer,
    },
    // {
    //   label: 'Note',
    //     testId: 'note',
    //   data: note && <Annotation fhirData={note} />,
    //   status: note,
    // },
    {
      label: 'Route',
      data: this.displayModel?.route,
      data_type: TableRowItemDataType.CodingList,
      enabled: this.displayModel?.has_route,
    },
      {
      label: 'Location',
      data: this.displayModel?.location,
      enabled: !!this.displayModel?.location,
    },
    {
      label: 'Site',
      data: this.displayModel?.site,
      data_type: TableRowItemDataType.CodingList,
      enabled: this.displayModel?.has_site,
    })

  }
  markForCheck(){
    this.changeRef.markForCheck()
  }

}
