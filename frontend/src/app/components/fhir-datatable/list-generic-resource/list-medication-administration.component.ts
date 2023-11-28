import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'fhir-datatable-medication-administration',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListMedicationAdministrationComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Medication', versions: '*', format: 'codeableConcept', getter: m => m.medicationCodeableConcept },
    { title: 'Route', versions: '*', format: 'codeableConcept', getter: m => m.dosage.route },
    { title: 'Effective', versions: '*', getter: m => attributeXTime(m,'effective')},
    { title: 'Status', versions: '*', getter: m => m.status},
    { title: 'Status Reason', versions: '*', format: 'codeableConcept', getter: m => m.statusReason?.[0] },
    { title: 'Recorded', versions: '*', format: 'date', getter: m => m.extension.recorded }
  ]
}
