import {Component} from '@angular/core';
import {GenericColumnDefn, DatatableGenericResourceComponent} from './datatable-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'fhir-datatable-appointment',
  templateUrl: './datatable-generic-resource.component.html',
  styleUrls: ['./datatable-generic-resource.component.scss']
})
export class DatatableAppointmentComponent extends DatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Type', versions: '*', format: 'codeableConcept', getter: a => a.serviceType },
    { title: 'Status', versions: '*', getter: a => a.status },
    { title: 'Reason', versions: '*',  format: 'code', getter: a => a.reason?.coding?.[0] },
    { title: 'Description', versions: '*', getter: a => a.description },
  ]
}
