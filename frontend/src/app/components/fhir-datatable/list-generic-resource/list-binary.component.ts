import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'fhir-datatable-binary',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListBinaryComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Content-Type', versions: '*', getter: c => c.contentType },
    { title: 'ID', versions: '*', getter: c => c.id },
    { title: 'Last Updated', versions: '*', getter: c => c.meta?.lastUpdated },
    { title: 'Size', versions: '*', getter: c => Math.floor((c.data?.length *4 +2)/3) }
  ]
}
