import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {DatatableComponent, ColumnMode} from '@swimlane/ngx-datatable';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {FORMATTERS, getPath, obsValue, attributeXTime} from './utils';
import {observableToBeFn} from 'rxjs/internal/testing/TestScheduler';

export class GenericColumnDefn {
  title: string
  prop?: string
  versions?: string
  format?: string
  getter: Function
  defaultValue?: string
}

@Component({
  selector: 'app-list-generic-resource',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListGenericResourceComponent implements OnInit {

  @Input() resourceList: ResourceFhir[] = []

  // description: string
  // c: ListGenericResourceComponentColumn[] = []
  columnDefinitions: GenericColumnDefn[] = []

  // datatable properties (DO NOT CHANGE)
  @ViewChild(DatatableComponent) table: DatatableComponent;
  rows = [];
  columns = []; //{ prop: 'name' }, { name: 'Company' }, { name: 'Gender' }
  ColumnMode = ColumnMode;

  constructor() {}

  ngOnInit(): void {
    this.columns = this.columnDefinitions.map((defn) => {
      let column = {name: defn.title, prop: defn.title.replace(/[^A-Z0-9]/ig, "_")}
      return column
    })

    this.rows = this.resourceList.map((resource) => {
      let row = {}

      this.columnDefinitions.forEach((defn) => {
        let resourceProp = defn.getter(resource.payload)
        let resourceFormatted = defn.format ? FORMATTERS[defn.format](resourceProp) : resourceProp
        row[defn.title.replace(/[^A-Z0-9]/ig, "_")] = resourceFormatted
        //TODO: handle defaultValue
      })

      console.log("ROW:", row)

      return row
    })
  }
}

///////////////////////////////////////////////////////////////////////////////////////
// START OVERRIDES
///////////////////////////////////////////////////////////////////////////////////////












