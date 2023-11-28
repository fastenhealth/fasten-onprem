import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'fhir-datatable-care-team',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListCareTeamComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Category', versions: '*', format: 'codableConcept', getter: c => c.category[0] },
    { title: 'Name', versions: '*', getter: c => c.name },
    { title: 'Period', versions: '*', format: 'period', getter: c => c.period },
    { title: 'Status', versions: '*', getter: a => a.status },
  ]
}
