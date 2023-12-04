import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {NgbCollapseModule} from '@ng-bootstrap/ng-bootstrap';
import {CommonModule} from '@angular/common';
import {BadgeComponent} from '../../common/badge/badge.component';
import {TableComponent} from '../../common/table/table.component';
import {Router, RouterModule} from '@angular/router';
import {FhirCardComponentInterface} from '../../fhir-card/fhir-card-component-interface';
import {ImmunizationModel} from '../../../../../lib/models/resources/immunization-model';
import {TableRowItem, TableRowItemDataType} from '../../common/table/table-row-item';
import * as _ from 'lodash';
import {LocationModel} from '../../../../../lib/models/resources/location-model';

@Component({
  standalone: true,
  imports: [NgbCollapseModule, CommonModule, BadgeComponent, TableComponent, RouterModule],
  selector: 'fhir-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit, FhirCardComponentInterface {
  @Input() displayModel: LocationModel
  @Input() showDetails: boolean = true
  @Input() isCollapsed: boolean = false

  tableData: TableRowItem[] = []

  constructor(public changeRef: ChangeDetectorRef, public router: Router) { }

  ngOnInit(): void {

    this.tableData.push(    {
        label: 'Type',
        data: this.displayModel?.type?.[0],
        data_type: TableRowItemDataType.CodableConcept,
        enabled: !!this.displayModel?.type?.[0],
      },
      {
        label: 'Physical Type',
        data: this.displayModel?.physical_type,
        data_type: TableRowItemDataType.CodableConcept,
        enabled: !!this.displayModel?.physical_type && this.displayModel?.physical_type?.coding?.length > 0,
      },
      {
        label: 'Location Mode',
        data: this.displayModel?.mode,
        enabled: !!this.displayModel?.mode,
      },
      {
        label: 'Description',
        data: this.displayModel?.description,
        enabled: !!this.displayModel?.description,
      },
      // {
      //   label: 'Address',
      //   data: this.displayModel?.address,
      //   data_type: TableRowItemDataType.Reference,
      //   enabled: !!this.displayModel?.address,
      // },
      {
        label: 'Telecom',
        data: this.displayModel?.telecom,
        data_type: TableRowItemDataType.Reference,
        enabled: !!this.displayModel?.telecom,
      },
      {
        label: 'Managing Organization',
        data: this.displayModel?.managing_organization,
        data_type: TableRowItemDataType.Reference,
        enabled: !!this.displayModel?.managing_organization,
      })

  }
  markForCheck(){
    this.changeRef.markForCheck()
  }

}
