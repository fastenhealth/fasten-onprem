import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';

@Component({
  selector: 'app-list-medication-request',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListMedicationRequestComponent extends ListGenericResourceComponent {
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
