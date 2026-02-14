import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FastenDisplayModel } from 'src/lib/models/fasten/fasten-display-model';
import { GenericColumnDefn } from '../../fhir-datatable/datatable-generic-resource/datatable-generic-resource.component';
import {
  ColumnMode,
  DatatableComponent,
  SelectionType,
} from '@swimlane/ngx-datatable';
import { FastenApiService } from 'src/app/services/fasten-api.service';
import {
  TypesenseDocument,
  TypesenseSearchResponse,
} from 'src/app/models/typesense/typesense-result-model';
import { FORMATTERS } from '../../fhir-datatable/datatable-generic-resource/utils';

class PageInfo {
  offset: number = 0; //this is the current page number. 0 is the first page. Matches the ng-datatable structure
}

@Component({
  selector: 'app-search-datatable-generic-resource',
  templateUrl: './search-datatable-generic-resource.component.html',
  styleUrls: ['./search-datatable-generic-resource.component.scss'],
})
export class SearchDatatableGenericResourceComponent implements OnInit {
  @Input() totalElements: number;
  @Input() resourceListType: string;
  @Input() sourceId: string;
  @Input() disabledResourceIds: string[] = [];
  @Output() selectionChanged: EventEmitter<FastenDisplayModel> =
  new EventEmitter<FastenDisplayModel>();

  currentPage: PageInfo = { offset: 0 };
  columnDefinitions: GenericColumnDefn[] = [];

  // datatable properties (DO NOT CHANGE)
  @ViewChild(DatatableComponent) table: DatatableComponent;
  rows = [];
  columns = []; //{ prop: 'name' }, { name: 'Company' }, { name: 'Gender' }
  ColumnMode = ColumnMode;
  SelectionType = SelectionType;

  searchQuery: string = '';

  constructor(
    public changeRef: ChangeDetectorRef,
    public fastenApi: FastenApiService
  ) {}

  ngOnInit(): void {
    this.currentPage = { offset: 0 };

    this.changePage(this.currentPage);
  }
  markForCheck() {
    this.changeRef.markForCheck();
  }

  changePage(page: PageInfo) {
    this.currentPage = page;
    this.fastenApi
      .searchResources({
        query: '*',
        type: this.resourceListType == 'All' ? '' : this.resourceListType,
        page: this.currentPage.offset + 1,
        per_page: 10,
      })
      .subscribe((response: TypesenseSearchResponse) => {
        const results = response.results;
        this.renderList(results as any as TypesenseDocument[]);
        this.markForCheck();
      });
  }

  search(): void {
    this.currentPage = { offset: 0 }; // reset to first page
    this.fastenApi
      .searchResources({
        query: this.searchQuery,
        type: this.resourceListType == 'All' ? '' : this.resourceListType,
        page: 0, // reset to first page
        per_page: 10,
      })
      .subscribe((response: TypesenseSearchResponse) => {
        const results = response.results;
        this.renderList(results as any as TypesenseDocument[]);
        this.markForCheck();
      });
  }

  renderList(resourceList: TypesenseDocument[]) {
    this.columns = this.columnDefinitions.map((defn) => {
      let column = {
        name: defn.title,
        prop: defn.title.replace(/[^A-Z0-9]/gi, '_'),
        sortable: false,
      };
      return column;
    });

    this.rows = resourceList.map((resource) => {
      let row = {
        resource: resource,
        source_id: resource.source_id,
        source_resource_type: resource.source_resource_type,
        source_resource_id: resource.source_resource_id,
        id: resource?.id ?? resource?.source_resource_id,
      };

      this.columnDefinitions.forEach((defn) => {
        try {
          let resourceProp = defn.getter(resource.resource_raw);
          let resourceFormatted = defn.format
            ? FORMATTERS[defn.format](resourceProp)
            : resourceProp;
          row[defn.title.replace(/[^A-Z0-9]/gi, '_')] = resourceFormatted;
        } catch (e) {
          //ignore
        }
      });

      return row;
    });
  }

  /**
   * The selected object is NOT a ResourceFHIR, its actually a dynamically created row object
   * created in renderList()
   * @param selected
   */
  onSelect({ selected }) {
    this.selectionChanged.emit(selected[0]);
  }

  //check to see if this row should be selectable
  // if the row is in the disabled list, it should not be selectable
  selectCheck(): (any) => boolean {
    return function (row) {
      let canSelect =
        this.disabledResourceIds.indexOf(row.source_resource_id) === -1;
      if (!canSelect) {
        console.warn(
          `Row id '${row.source_resource_id}' is disabled, cannot select`
        );
      }
      return canSelect;
    }.bind(this);
  }
}
