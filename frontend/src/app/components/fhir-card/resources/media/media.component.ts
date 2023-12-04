import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {DocumentReferenceModel} from '../../../../../lib/models/resources/document-reference-model';
import {TableRowItem, TableRowItemDataType} from '../../common/table/table-row-item';
import {Router, RouterModule} from '@angular/router';
import {FhirCardComponentInterface} from '../../fhir-card/fhir-card-component-interface';
import {MediaModel} from '../../../../../lib/models/resources/media-model';
import {NgbCollapseModule} from '@ng-bootstrap/ng-bootstrap';
import {CommonModule} from '@angular/common';
import {BadgeComponent} from '../../common/badge/badge.component';
import {TableComponent} from '../../common/table/table.component';
import {BinaryComponent} from '../binary/binary.component';

@Component({
  standalone: true,
  imports: [NgbCollapseModule, CommonModule, BadgeComponent, TableComponent, RouterModule, BinaryComponent],
  selector: 'fhir-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss']
})
export class MediaComponent implements OnInit, FhirCardComponentInterface{
  @Input() displayModel: MediaModel
  @Input() showDetails: boolean = true
  @Input() isCollapsed: boolean = false
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
