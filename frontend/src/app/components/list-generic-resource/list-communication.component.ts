import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'app-list-communication',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListCommunicationComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Reason', versions: '*', format: 'code', getter: c => c.reasonCode[0].coding[0] },
    { title: 'Sent', versions: '*', format: 'date', getter: c => c.sent },
    { title: 'Received', versions: '*', format: 'date', getter: c => c.received },
    { title: 'Status', versions: '*', getter: c => c.status }
  ]
}
