import {Component} from '@angular/core';
import {attributeXTime} from './utils';
import {GenericColumnDefn, DatatableGenericResourceComponent} from './datatable-generic-resource.component';

@Component({
  selector: 'fhir-datatable-practitioner',
  templateUrl: './datatable-generic-resource.component.html',
  styleUrls: ['./datatable-generic-resource.component.scss']
})
export class DatatablePractitionerComponent extends DatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Name', versions: '*', format: 'humanName', getter: p => p.name?.[0] },
    { title: 'Address', versions: '*', format: 'address', getter: p => p.address?.[0] },
    { title: 'Contact', versions: '*', format: 'contact', getter: p => p.telecom?.[0] },
  ]
}
