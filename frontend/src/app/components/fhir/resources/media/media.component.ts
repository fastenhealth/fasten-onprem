import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {DocumentReferenceModel} from '../../../../../lib/models/resources/document-reference-model';
import {TableRowItem, TableRowItemDataType} from '../../common/table/table-row-item';
import {Router} from '@angular/router';
import {FhirResourceComponentInterface} from '../../fhir-resource/fhir-resource-component-interface';
import {MediaModel} from '../../../../../lib/models/resources/media-model';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss']
})
export class MediaComponent implements OnInit, FhirResourceComponentInterface{
  @Input() displayModel: MediaModel
  @Input() showDetails: boolean = true
  isCollapsed: boolean = false
  tableData: TableRowItem[] = []

  constructor(public changeRef: ChangeDetectorRef, public router: Router) {}


  ngOnInit(): void {
    this.tableData = [
      {
        label: 'Description',
        data: this.displayModel?.description,
        enabled: !!this.displayModel?.description,
      },
      // {
      //   label: 'Performer',
      //   data: this.displayModel?.performer,
      //   data_type: TableRowItemDataType.Reference,
      //   enabled: this.displayModel?.has_performer,
      // },
      // {
      //   label: 'Conclusion',
      //   data: this.displayModel?.conclusion,
      //   enabled: !!this.displayModel?.conclusion,
      // },
    ];
  }
  markForCheck(){
    this.changeRef.markForCheck()
  }
}
