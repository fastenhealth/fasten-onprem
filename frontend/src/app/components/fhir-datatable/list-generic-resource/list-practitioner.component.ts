import {Component} from '@angular/core';
import {attributeXTime} from './utils';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';

@Component({
  selector: 'fhir-datatable-practitioner',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListPractitionerComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Name', versions: '*', format: 'humanName', getter: p => p.name?.[0] },
    { title: 'Address', versions: '*', format: 'address', getter: p => p.address?.[0] },
    { title: 'Contact', versions: '*', format: 'contact', getter: p => p.telecom?.[0] },
  ]
}
