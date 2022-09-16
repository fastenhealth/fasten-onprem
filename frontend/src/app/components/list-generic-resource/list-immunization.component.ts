import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';

@Component({
  selector: 'app-list-immunization',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListImmunizationComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Vaccine', versions: '*', format: 'code', getter: i => i.vaccineCode.coding[0] },
    { title: 'Date Given', versions: '*', format: 'date', getter: i => i.date || i.occurrenceDateTime || i.occurrenceStringe },
    { title: 'Date Recorded', versions: '*', format: 'date', getter: i => i.recorded }
  ]
}
