import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DatatableComponent, ColumnMode, SelectionType} from '@swimlane/ngx-datatable';
import {ResourceFhir} from '../../../models/fasten/resource_fhir';
import {FORMATTERS, getPath, obsValue, attributeXTime} from './utils';
import {FastenApiService} from '../../../services/fasten-api.service';
import {FastenDisplayModel} from '../../../../lib/models/fasten/fasten-display-model';
import { ActivatedRoute } from '@angular/router';

//all Resource list components must implement this Interface
export interface ResourceListComponentInterface {
  //inputs
  resourceListType: string;
  totalElements: number;
  sourceId: string;
  disabledResourceIds: string[];
  isDelegatedResource?: boolean;

  //outputs
  selectionChanged: EventEmitter<FastenDisplayModel>

  //private functions
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
  templateUrl: './datatable-generic-resource.component.html',
  styleUrls: ['./datatable-generic-resource.component.scss']
})
export class DatatableGenericResourceComponent implements OnInit, ResourceListComponentInterface  {
  @Input() totalElements: number;
  @Input() resourceListType: string;
  @Input() sourceId: string;
  @Input() disabledResourceIds: string[] = [];
  @Input() isDelegatedResource: boolean = false;
  @Output() selectionChanged: EventEmitter<FastenDisplayModel> = new EventEmitter<FastenDisplayModel>();

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

  constructor(public changeRef: ChangeDetectorRef, public fastenApi: FastenApiService, private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.currentPage = {offset: 0}

    this.changePage(this.currentPage)
  }
  markForCheck(){
    this.changeRef.markForCheck()
  }

  changePage(page: PageInfo){
    this.currentPage = page;

    if (this.isDelegatedResource && this.route.snapshot.paramMap.get('owner_user_id')) {
      this.fastenApi
        .getDelegatedResources(
          this.route.snapshot.paramMap.get('owner_user_id'),
          this.resourceListType,
          this.sourceId,
          null,
          this.currentPage.offset
        )
        .subscribe((resourceList: ResourceFhir[]) => {
          this.renderList(resourceList);
          this.markForCheck();
        });
    } else {
      this.fastenApi
        .getResources(
          this.resourceListType,
          this.sourceId,
          null,
          this.currentPage.offset
        )
        .subscribe((resourceList: ResourceFhir[]) => {
          this.renderList(resourceList);
          this.markForCheck();
        });
    }
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
    this.columns = this.columnDefinitions.map((defn) => {
      let column = {name: defn.title, prop: defn.title.replace(/[^A-Z0-9]/ig, "_"), sortable: false}
      return column
    })

    this.rows = resourceList.map((resource) => {
      let row = {
        resource: resource,
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
    this.selectionChanged.emit(selected[0])
  }

  //check to see if this row should be selectable
  // if the row is in the disabled list, it should not be selectable
  selectCheck(): (any) => boolean {
    return function(row) {
      let canSelect = this.disabledResourceIds.indexOf(row.source_resource_id) === -1
      if(!canSelect){
        console.warn(`Row id '${row.source_resource_id}' is disabled, cannot select`)
      }
      return canSelect
    }.bind(this)
  }
}

///////////////////////////////////////////////////////////////////////////////////////
// START OVERRIDES
///////////////////////////////////////////////////////////////////////////////////////
