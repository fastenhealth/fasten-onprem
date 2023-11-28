import {Component} from '@angular/core';
import {attributeXTime} from './utils';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';

@Component({
  selector: 'fhir-datatable-procedure',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListProcedureComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Procedure', versions: '*', format: 'codeableConcept', getter: p => p.code },
    { title: 'Performed', versions: '*', getter: p => attributeXTime(p,'performed') },
    { title: 'ID', versions: '*', getter: p => p.id },
    { title: 'Recorded', versions: '*', format: 'dateTime', getter: p => p.extension?.recorded },
    { title: 'Reason', versions: '*', format: 'codeableConcept', getter: p => p.reasonCode?.[0] },
    { title: 'Status', versions: '*', getter: p => p.status },
    { title: 'Status Reason', versions: '*', format: 'codeableConcept', getter: p => p.statusReason }
  ]
}
