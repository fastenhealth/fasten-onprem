import {Component} from '@angular/core';
import {GenericColumnDefn, DatatableGenericResourceComponent} from './datatable-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'fhir-datatable-medication-administration',
  templateUrl: './datatable-generic-resource.component.html',
  styleUrls: ['./datatable-generic-resource.component.scss']
})
export class DatatableMedicationAdministrationComponent extends DatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Medication', versions: '*', format: 'codeableConcept', getter: m => m.medicationCodeableConcept },
    { title: 'Route', versions: '*', format: 'codeableConcept', getter: m => m.dosage.route },
    { title: 'Effective', versions: '*', getter: m => attributeXTime(m,'effective')},
    { title: 'Status', versions: '*', getter: m => m.status},
    { title: 'Status Reason', versions: '*', format: 'codeableConcept', getter: m => m.statusReason?.[0] },
    { title: 'Recorded', versions: '*', format: 'date', getter: m => m.extension.recorded }
  ]
}
