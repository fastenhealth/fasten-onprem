import {Component} from '@angular/core';
import {GenericColumnDefn, DatatableGenericResourceComponent} from './datatable-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'fhir-datatable-organization',
  templateUrl: './datatable-generic-resource.component.html',
  styleUrls: ['./datatable-generic-resource.component.scss']
})
export class DatatableOrganizationComponent extends DatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Name', versions: '*', getter: d => d.name || d.alias?.[0] },
    { title: 'Address', versions: '*', format: 'address', getter: d => d.address?.[0] },
    { title: 'Contact', versions: '*', format: 'contact', getter: d => d.telecom?.[0] },
  ]
}
