import {ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {DatatableComponent, ColumnMode, SelectionType} from '@swimlane/ngx-datatable';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {FORMATTERS, getPath, obsValue, attributeXTime} from './utils';
import {observableToBeFn} from 'rxjs/internal/testing/TestScheduler';
import {Router} from '@angular/router';

//all Resource list components must implement this Interface
export interface ResourceListComponentInterface {
  resourceList: ResourceFhir[];
  markForCheck()
}


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
export class ListGenericResourceComponent implements OnInit, ResourceListComponentInterface  {

  @Input() resourceList: ResourceFhir[] = []

  // description: string
  // c: ListGenericResourceComponentColumn[] = []
  columnDefinitions: GenericColumnDefn[] = []

  // datatable properties (DO NOT CHANGE)
  @ViewChild(DatatableComponent) table: DatatableComponent;
  rows = [];
  columns = []; //{ prop: 'name' }, { name: 'Company' }, { name: 'Gender' }
  ColumnMode = ColumnMode;
  SelectionType = SelectionType;

  constructor(public changeRef: ChangeDetectorRef, public router: Router) {}

  ngOnInit(): void {
    console.log("INIT GENERIC RESOURCE")

    this.renderList()
  }
  markForCheck(){
    this.changeRef.markForCheck()
  }

  renderList(){
    console.log("GENERIC RESOURCE RENDERLSIT")
    this.columns = this.columnDefinitions.map((defn) => {
      let column = {name: defn.title, prop: defn.title.replace(/[^A-Z0-9]/ig, "_")}
      return column
    })

    this.rows = this.resourceList.map((resource) => {
      let row = {
        source_id: resource.source_id,
        source_resource_type: resource.source_resource_type,
        source_resource_id: resource.source_resource_id
      }

      this.columnDefinitions.forEach((defn) => {
        try{
          let resourceProp = defn.getter(resource.payload)
          let resourceFormatted = defn.format ? FORMATTERS[defn.format](resourceProp) : resourceProp
          row[defn.title.replace(/[^A-Z0-9]/ig, "_")] = resourceFormatted
        }catch (e){
          //ignore
        }
      })
      return row
    })
  }

  onSelect({ selected }) {
    console.log('Select Event', selected);
    this.router.navigateByUrl(`/source/${selected[0].source_id}/resource/${selected[0].source_resource_id}`);
  }

}

///////////////////////////////////////////////////////////////////////////////////////
// START OVERRIDES
///////////////////////////////////////////////////////////////////////////////////////












