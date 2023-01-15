import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {FhirResourceComponentInterface} from '../../fhir-resource/fhir-resource-component-interface';
import {TableRowItem, TableRowItemDataType} from '../../common/table/table-row-item';
import {Router} from '@angular/router';
import {MedicationModel} from '../../../../../lib/models/resources/medication-model';

@Component({
  selector: 'fhir-medication',
  templateUrl: './medication.component.html',
  styleUrls: ['./medication.component.scss']
})
export class MedicationComponent implements OnInit, FhirResourceComponentInterface {
  @Input() displayModel: MedicationModel
  @Input() showDetails: boolean = true
  isCollapsed: boolean = false

  tableData: TableRowItem[] = []

  constructor(public changeRef: ChangeDetectorRef, public router: Router) {}

  ngOnInit(): void {

    this.tableData = [
      {
        label: 'Manufacturer',
        data: this.displayModel.manufacturer,
        data_type: TableRowItemDataType.Reference,
        enabled: !!this.displayModel.manufacturer,
      },
      {
        label: 'Form',
        data: this.displayModel.product_form,
        data_type: TableRowItemDataType.CodingList,
        enabled: !!this.displayModel.product_form,
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
        data: this.displayModel.package_coding,
        data_type: TableRowItemDataType.CodingList,
        enabled: this.displayModel.has_package_coding,
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
