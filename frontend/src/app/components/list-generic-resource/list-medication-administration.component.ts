import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'app-list-medication-administration',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListMedicationAdministrationComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Medication', versions: '*', format: 'code', getter: m => m.medicationCodeableConcept.coding[0] },
    { title: 'Route', versions: '*', format: 'code', getter: m => m.dosage.route.coding[0] },
    { title: 'Effective', versions: '*', getter: m => attributeXTime(m,'effective')},
    { title: 'Status', versions: '*', getter: m => m.status},
    { title: 'Status Reason', versions: '*', format: 'code', getter: m => m.statusReason[0].coding[0] },
    { title: 'Recorded', versions: '*', format: 'date', getter: m => m.extension.recorded }
  ]
}
