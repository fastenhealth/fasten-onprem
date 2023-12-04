import {Component, OnChanges, OnInit} from '@angular/core';
import {GenericColumnDefn, DatatableGenericResourceComponent, ResourceListComponentInterface} from './datatable-generic-resource.component';

@Component({
  selector: 'fhir-datatable-encounter',
  templateUrl: './datatable-generic-resource.component.html',
  styleUrls: ['./datatable-generic-resource.component.scss']
})
export class DatatableEncounterComponent extends DatatableGenericResourceComponent  {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Period', versions: '*', format: 'period', getter: e => e.period },
    { title: 'Encounter', versions: '*', format: 'codeableConcept', getter: e => e.type?.[0] },
    { title: 'Reason', versions: '*', format: 'codeableConcept', getter: e => e.reasonCode?.[0] },
    { title: 'Practitioner', versions: '*', getter: e => e.participant?.[0]?.individual?.display },
    { title: 'Discharge Disposition', versions: '*', format: 'codeableConcept', getter: e => e.hospitalization?.dischargeDisposition },
  ]
}
