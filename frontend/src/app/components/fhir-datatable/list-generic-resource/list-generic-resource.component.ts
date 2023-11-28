import {ChangeDetectorRef, Component, Input, OnInit, ViewChild} from '@angular/core';
import {DatatableComponent, ColumnMode, SelectionType} from '@swimlane/ngx-datatable';
import {ResourceFhir} from '../../../models/fasten/resource_fhir';
import {FORMATTERS, getPath, obsValue, attributeXTime} from './utils';
import {Router} from '@angular/router';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {FastenApiService} from '../../../services/fasten-api.service';

//all Resource list components must implement this Interface
export interface ResourceListComponentInterface {
  resourceListType: string;
  totalElements: number;
  sourceId: string;
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

class PageInfo {
  offset: number = 0 //this is the current page number. 0 is the first page. Matches the ng-datatable structure
}

@Component({
  selector: 'fhir-datatable-generic-resource',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListGenericResourceComponent implements OnInit, ResourceListComponentInterface  {
  @Input() totalElements: number;
  @Input() resourceListType: string;
  @Input() sourceId: string;

  currentPage: PageInfo = {offset: 0}
  // @Input() resourceList: ResourceFhir[] = []

  // description: string
  // c: ListGenericResourceComponentColumn[] = []
  columnDefinitions: GenericColumnDefn[] = []

  // datatable properties (DO NOT CHANGE)
  @ViewChild(DatatableComponent) table: DatatableComponent;
  rows = [];
  columns = []; //{ prop: 'name' }, { name: 'Company' }, { name: 'Gender' }
  ColumnMode = ColumnMode;
  SelectionType = SelectionType;

  constructor(public changeRef: ChangeDetectorRef, public router: Router, public fastenApi: FastenApiService) {

  }

  ngOnInit(): void {
    console.log("INIT GENERIC RESOURCE")
    this.currentPage = {offset: 0}

    this.changePage(this.currentPage)
  }
  markForCheck(){
    this.changeRef.markForCheck()
  }

  changePage(page: PageInfo){
    console.log("Requesting page:" + JSON.stringify(page))
    this.currentPage = page;
    this.fastenApi.getResources(this.resourceListType, this.sourceId, null, this.currentPage.offset)
      .subscribe((resourceList: ResourceFhir[]) => {
        this.renderList(resourceList)
        this.markForCheck()
      });
  }

  // getResources(page?: number): Observable<ResourceFhir[]>{
  //   // if(this.resourceListType && !this.resourceListCache[this.resourceListType]){
  //   //   // this resource type list has not been downloaded yet, do so now
  //     return
  //       .pipe(map((resourceList: ResourceFhir[]) => {
  //         //cache this response so we can skip the request next time
  //         // this.resourceListCache[this.resourceListType] = resourceList
  //         return resourceList
  //       }))
  //   // } else {
  //   //   return of(this.resourceListCache[this.resourceListType] || [])
  //   // }
  // }


  renderList(resourceList: ResourceFhir[]){
    console.log("GENERIC RESOURCE RENDERLSIT")
    this.columns = this.columnDefinitions.map((defn) => {
      let column = {name: defn.title, prop: defn.title.replace(/[^A-Z0-9]/ig, "_"), sortable: false}
      return column
    })

    this.rows = resourceList.map((resource) => {
      let row = {
        source_id: resource.source_id,
        source_resource_type: resource.source_resource_type,
        source_resource_id: resource.source_resource_id
      }

      this.columnDefinitions.forEach((defn) => {
        try{
          let resourceProp = defn.getter(resource.resource_raw)
          let resourceFormatted = defn.format ? FORMATTERS[defn.format](resourceProp) : resourceProp
          row[defn.title.replace(/[^A-Z0-9]/ig, "_")] = resourceFormatted
        }catch (e){
          //ignore
        }
      })
      return row
    })
  }

  /**
   * The selected object is NOT a ResourceFHIR, its actually a dynamically created row object
   * created in renderList()
   * @param selected
   */
  onSelect({ selected }) {
    console.log('Select Event', selected);
    this.router.navigateByUrl(`/explore/${selected[0].source_id}/resource/${selected[0].source_resource_id}`);

  }

}

///////////////////////////////////////////////////////////////////////////////////////
// START OVERRIDES
///////////////////////////////////////////////////////////////////////////////////////












