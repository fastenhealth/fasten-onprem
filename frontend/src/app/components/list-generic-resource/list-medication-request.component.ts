import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';

@Component({
  selector: 'app-list-medication-request',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListMedicationRequestComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Medication', versions: '*', format: 'code', getter: m => m.medicationCodeableConcept?.coding[0] },
    { title: 'Dosage Timing', versions: '*', format: 'period', getter: m => m.dosageInstruction[0]?.timing.repeat.boundsPeriod},
    { title: 'Dosage Date', versions: '*', format: 'date', getter: m => m.dosageInstruction[0]?.timing.event},
    { title: 'Author Date', versions: '*', format: 'date', getter: m => m.authoredOn },
    { title: 'Do Not Perform', versions: '*', getter: m => m.doNotPerform},
    { title: 'Reason', versions: '*', format: 'code', getter: m => m.reasonCode[0]?.coding[0] },
    { title: 'Route', versions: '*', format: 'code', getter: m => m.dosageInstruction[0]?.route.coding[0] }
  ]
}
