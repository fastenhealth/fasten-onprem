import {Component, OnChanges, OnInit} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent, ResourceListComponentInterface} from './list-generic-resource.component';

@Component({
  selector: 'app-list-fallback',
  templateUrl: './list-fallback.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListFallbackComponent extends ListGenericResourceComponent  {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Id', versions: '*', getter: e => e.id },
    { title: 'Title', versions: '*', getter: e => e.reasonCode?.[0] },
  ]
}
