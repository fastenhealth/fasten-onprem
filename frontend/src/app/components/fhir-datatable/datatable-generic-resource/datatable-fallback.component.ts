import {Component, OnChanges, OnInit} from '@angular/core';
import {GenericColumnDefn, DatatableGenericResourceComponent, ResourceListComponentInterface} from './datatable-generic-resource.component';

@Component({
  selector: 'fhir-datatable-fallback',
  templateUrl: './datatable-fallback.component.html',
  styleUrls: ['./datatable-generic-resource.component.scss']
})
export class DatatableFallbackComponent extends DatatableGenericResourceComponent  {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Id', versions: '*', getter: e => e.id },
    { title: 'Title', versions: '*', getter: e => e.reasonCode?.[0] },
  ]
}
