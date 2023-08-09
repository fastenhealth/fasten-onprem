import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'app-list-appointment',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListAppointmentComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Type', versions: '*', format: 'codeableConcept', getter: a => a.serviceType },
    { title: 'Status', versions: '*', getter: a => a.status },
    { title: 'Reason', versions: '*',  format: 'code', getter: a => a.reason?.coding?.[0] },
    { title: 'Description', versions: '*', getter: a => a.description },
  ]
}
