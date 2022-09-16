import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';

@Component({
  selector: 'app-list-encounter',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListEncounterComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Encounter', versions: '*', format: 'code', getter: e => e.type[0].coding[0] },
    { title: 'Period', versions: '*', format: 'period', getter: e => e.period },
    { title: 'Diagnosis', versions: '*', getter: e => e.diagnosis?.map(d => d.condition?.reference).join()},
    { title: 'Discharge Disposition', versions: '*', format: 'code', getter: e => e.hospitalization?.dischargeDisposition.coding[0] }
  ]
}
