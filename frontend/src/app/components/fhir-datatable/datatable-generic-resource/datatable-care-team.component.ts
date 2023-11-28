import {Component} from '@angular/core';
import {GenericColumnDefn, DatatableGenericResourceComponent} from './datatable-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'fhir-datatable-care-team',
  templateUrl: './datatable-generic-resource.component.html',
  styleUrls: ['./datatable-generic-resource.component.scss']
})
export class DatatableCareTeamComponent extends DatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Category', versions: '*', format: 'codableConcept', getter: c => c.category[0] },
    { title: 'Name', versions: '*', getter: c => c.name },
    { title: 'Period', versions: '*', format: 'period', getter: c => c.period },
    { title: 'Status', versions: '*', getter: a => a.status },
  ]
}
