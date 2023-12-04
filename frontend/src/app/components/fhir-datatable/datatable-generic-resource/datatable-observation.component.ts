import {Component} from '@angular/core';
import {attributeXTime, obsValue} from './utils';
import {GenericColumnDefn, DatatableGenericResourceComponent} from './datatable-generic-resource.component';

@Component({
  selector: 'fhir-datatable-observation',
  templateUrl: './datatable-generic-resource.component.html',
  styleUrls: ['./datatable-generic-resource.component.scss']
})
export class DatatableObservationComponent extends DatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Issued Date', 'versions': '*', format: 'date', getter: o => o.issued },
    { title: 'Effective', 'versions': '*', getter: o => attributeXTime(o,'effective') },
    { title: 'Observation', versions: '*', format: 'codeableConcept', getter: o => o.code },
    { title: 'Value', versions: '*', getter: o => obsValue(o) },
    // { title: 'Issued Date', 'versions': '*', format: 'date', getter: o => o.issued },
    { title: 'ID', versions: '*', getter: o => o.id }
  ]
}
