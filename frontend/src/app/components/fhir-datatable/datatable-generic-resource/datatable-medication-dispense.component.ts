import {Component} from '@angular/core';
import {GenericColumnDefn, DatatableGenericResourceComponent} from './datatable-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'fhir-datatable-medication-dispense',
  templateUrl: './datatable-generic-resource.component.html',
  styleUrls: ['./datatable-generic-resource.component.scss']
})
export class DatatableMedicationDispenseComponent extends DatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Medication', versions: '*', format: 'code', getter: m => m.medicationCodeableConcept?.coding?.[0] },
    { title: 'Handed Over Date', versions: '*', format: 'date', getter: m => m.whenHandedOver}
  ]
}
