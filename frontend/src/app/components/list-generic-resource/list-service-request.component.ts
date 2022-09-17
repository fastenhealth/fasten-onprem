import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'app-list-service-request',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListServiceRequestComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Service', versions: '*', format: 'code', getter: s => s.code.coding[0] },
    { title: 'Author Date', versions: '*', format: 'date', getter: s => s.authoredOn },
    { title: 'Status', versions: '*', getter: s => s.status },
    { title: 'Reason', versions: '*', format: 'code', getter: s => s.reasonCode[0].coding[0] },
    { title: 'ID', versions: '*', getter: s => s.id },
    { title: 'Do Not Perform', versions: '*', getter: s => s.doNotPerform },
    { title: 'Reason Refused', versions: '*', format: 'code', getter: s => s.extension.reasonRefused.coding[0] }
  ]
}
