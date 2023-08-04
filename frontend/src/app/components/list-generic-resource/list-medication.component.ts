import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';

@Component({
  selector: 'app-list-medication',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListMedicationRequestComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    // { title: 'Medication', versions: '*', format: 'code', getter: m => m.medicationCodeableConcept?.coding[0] },
    { title: 'Author Date', versions: '*', format: 'date', getter: m => m.authoredOn },
    { title: 'Medication', versions: '*', getter: m => m.medicationCodeableConcept.coding[0].display }, //remove drug code
    { title: 'Dosage Timing', versions: '*', format: 'period', getter: m => m.dosageInstruction[0]?.timing.repeat.boundsPeriod},
    // Not used { title: 'Dosage Date', versions: '*', format: 'date', getter: m => m.dosageInstruction[0]?.timing.event},
    { title: 'Route', versions: '*', format: 'code', getter: m => m.dosageInstruction[0]?.route.coding[0] },
    { title: 'Do Not Perform', versions: '*', getter: m => m.doNotPerform},
    { title: 'Reason', versions: '*', format: 'code', getter: m => m.reasonCode[0]?.coding[0] },
  ]
}
