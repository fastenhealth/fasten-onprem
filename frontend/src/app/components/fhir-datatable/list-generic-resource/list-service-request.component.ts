import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'fhir-datatable-service-request',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListServiceRequestComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    // orig { title: 'Service', versions: '*', format: 'code', getter: s => s.code.coding[0] },
    { title: 'Author Date', versions: '*', format: 'date', getter: s => s.authoredOn },
    { title: 'Service', versions: '*', format:'codeableConcept', getter: s => s.category?.[0] },
    { title: 'Ordered', versions: '*', format:'codeableConcept', getter: s => s.code },
    { title: 'Dx', versions: '*', format: 'codeableConcept', getter: s => s.reasonCode?.[0] }, //Was Task
    { title: 'Ordered By', versions: '*', getter: s => s.requester?.display },
    { title: 'Status', versions: '*', getter: s => s.status },
    // Useless { title: 'ID', versions: '*', getter: s => s.id },
    // Not used { title: 'Do Not Perform', versions: '*', getter: s => s.doNotPerform },
    // Not used { title: 'Reason Refused', versions: '*', format: 'code', getter: s => s.extension.reasonRefused.coding[0] }
  ]
}
