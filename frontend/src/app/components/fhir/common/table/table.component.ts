import {Component, Input, OnInit} from '@angular/core';
import {TableRowItem} from './table-row-item';
import {BinaryModel} from '../../../../../lib/models/resources/binary-model';
import {FastenDisplayModel} from '../../../../../lib/models/fasten/fasten-display-model';

@Component({
  selector: 'fhir-ui-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  @Input() tableData: TableRowItem[] = []
  @Input() displayModel: FastenDisplayModel

  constructor() { }

  ngOnInit(): void {
    this.tableData = this.tableData.filter((item) => {return item.enabled})
  }

}
