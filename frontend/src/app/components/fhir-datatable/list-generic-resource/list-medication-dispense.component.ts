import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'fhir-datatable-medication-dispense',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListMedicationDispenseComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Medication', versions: '*', format: 'code', getter: m => m.medicationCodeableConcept?.coding?.[0] },
    { title: 'Handed Over Date', versions: '*', format: 'date', getter: m => m.whenHandedOver}
  ]
}
