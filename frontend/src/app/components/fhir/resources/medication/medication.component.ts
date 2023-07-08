import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {FhirResourceComponentInterface} from '../../fhir-resource/fhir-resource-component-interface';
import {TableRowItem, TableRowItemDataType} from '../../common/table/table-row-item';
import {Router} from '@angular/router';
import {MedicationModel} from '../../../../../lib/models/resources/medication-model';
import {NgbCollapseModule} from "@ng-bootstrap/ng-bootstrap";
import {CommonModule} from "@angular/common";
import {BadgeComponent} from "../../common/badge/badge.component";
import {TableComponent} from "../../common/table/table.component";
import {GlossaryLookupComponent} from '../../../glossary-lookup/glossary-lookup.component';

@Component({
  standalone: true,
  imports: [NgbCollapseModule, CommonModule, BadgeComponent, TableComponent, GlossaryLookupComponent],
  selector: 'fhir-medication',
  templateUrl: './medication.component.html',
  styleUrls: ['./medication.component.scss']
})
export class MedicationComponent implements OnInit, FhirResourceComponentInterface {
  @Input() displayModel: MedicationModel
  @Input() showDetails: boolean = true

  //these are used to populate the description of the resource. May not be available for all resources
  resourceCode?: string;
  resourceCodeSystem?: string;

  isCollapsed: boolean = false

  tableData: TableRowItem[] = []

  constructor(public changeRef: ChangeDetectorRef, public router: Router) {}

  ngOnInit(): void {
    this.resourceCode = this.displayModel?.title?.code
    this.resourceCodeSystem = this.displayModel?.title?.system

    this.tableData = [
      {
        label: 'Manufacturer',
        data: this.displayModel?.manufacturer,
        data_type: TableRowItemDataType.Reference,
        enabled: !!this.displayModel?.manufacturer,
      },
      {
        label: 'Form',
        data: this.displayModel?.product_form,
        data_type: TableRowItemDataType.CodingList,
        enabled: !!this.displayModel?.product_form,
      },
      // {
      //   label: 'Ingredient',
      //   data:
      //     hasProductIngredient &&
      //     productIngredient.map((item, i) => (
      //         <Ingredient key={`item-${i}`} {...item} />
      //     )),
      //   status: hasProductIngredient,
      // },
      {
        label: 'Package container',
        data: this.displayModel?.package_coding,
        data_type: TableRowItemDataType.CodingList,
        enabled: this.displayModel?.has_package_coding,
      },
      // {
      //   label: 'Images',
      //     testId: 'product-images',
      //   data:
      //   hasImages &&
      //   images.map((item, i) => (
      //     <Attachment key={`item-${i}`} fhirData={item} isImage />
      // )),
      //   status: hasImages,
      // },
    ];

  }
  markForCheck(){
    this.changeRef.markForCheck()
  }
}
