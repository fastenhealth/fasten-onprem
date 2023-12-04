import {Component} from '@angular/core';
import {GenericColumnDefn, DatatableGenericResourceComponent} from './datatable-generic-resource.component';

@Component({
  selector: 'fhir-datatable-medication-request',
  templateUrl: './datatable-generic-resource.component.html',
  styleUrls: ['./datatable-generic-resource.component.scss']
})
export class DatatableMedicationRequestComponent extends DatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Author Date', versions: '*', format: 'date', getter: m => m.authoredOn },
    { title: 'Medication', versions: '*', format: 'codeableConcept', getter: m => m.medicationCodeableConcept }, //remove drug code
    { title: 'Dosage Timing', versions: '*', format: 'period', getter: m => m.dosageInstruction?.[0]?.timing?.repeat?.boundsPeriod},
    // { title: 'Dosage Date', versions: '*', format: 'date', getter: m => m.dosageInstruction[0]?.timing.event},
    { title: 'Route', versions: '*', format: 'codeableConcept', getter: m => m.dosageInstruction?.[0]?.route },
    { title: 'Do Not Perform', versions: '*', getter: m => m.doNotPerform},
    { title: 'Reason', versions: '*', format: 'codeableConcept', getter: m => m.reasonCode?.[0] },
  ]
}
