import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'fhir-datatable-organization',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListOrganizationComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Name', versions: '*', getter: d => d.name || d.alias?.[0] },
    { title: 'Address', versions: '*', format: 'address', getter: d => d.address?.[0] },
    { title: 'Contact', versions: '*', format: 'contact', getter: d => d.telecom?.[0] },
  ]
}
