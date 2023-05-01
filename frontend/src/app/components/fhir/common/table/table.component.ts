import {Component, Input, OnInit} from '@angular/core';
import {TableRowItem} from './table-row-item';
import {FastenDisplayModel} from '../../../../../lib/models/fasten/fasten-display-model';
import {CommonModule} from "@angular/common";
import {CodingComponent} from "../../datatypes/coding/coding.component";
import {Router, RouterModule} from "@angular/router";

@Component({
  standalone: true,
  imports: [CommonModule, CodingComponent, RouterModule],
  providers: [RouterModule],
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
