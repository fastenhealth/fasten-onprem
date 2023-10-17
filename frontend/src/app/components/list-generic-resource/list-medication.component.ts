import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';

@Component({
  selector: 'app-list-medication',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListMedicationComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Medication', versions: '*', getter: c => c.code.text },
    { title: 'Date Prescribed', versions: '*', format: 'date', getter: c => c.authoredOn },
    { title: 'Status', 'versions': '*', getter: c => c.status }
  ]
}
