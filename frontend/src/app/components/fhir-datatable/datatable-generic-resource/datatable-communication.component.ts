import {Component} from '@angular/core';
import {GenericColumnDefn, DatatableGenericResourceComponent} from './datatable-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'fhir-datatable-communication',
  templateUrl: './datatable-generic-resource.component.html',
  styleUrls: ['./datatable-generic-resource.component.scss']
})
export class DatatableCommunicationComponent extends DatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Reason', versions: '*', format: 'code', getter: c => c.reasonCode[0].coding[0] },
    { title: 'Sent', versions: '*', format: 'date', getter: c => c.sent },
    { title: 'Received', versions: '*', format: 'date', getter: c => c.received },
    { title: 'Status', versions: '*', getter: c => c.status }
  ]
}
