import {Component, OnInit} from '@angular/core';
import {GenericColumnDefn, DatatableGenericResourceComponent, ResourceListComponentInterface} from './datatable-generic-resource.component';
import {FORMATTERS} from './utils';

@Component({
  selector: 'fhir-datatable-condition',
  templateUrl: './datatable-generic-resource.component.html',
  styleUrls: ['./datatable-generic-resource.component.scss']
})
export class DatatableConditionComponent extends DatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Condition', versions: '*', format: 'codeableConcept', getter: c => c.code },
    { title: 'Date of Onset', versions: '*', format: 'date', getter: c => c.onsetDateTime },
    { title: 'Date Resolved', 'versions': '*', format: 'date', getter: c => c.abatementDateTime, defaultValue: 'N/A' },
    { title: 'Recorded Date', versions: '*', format: 'date', getter: c => c.recordedDate },
    { title: 'Severity', versions: '*', format: 'codeableConcept', getter: c => c.severity },
    { title: 'Body Site', versions: '*', format: 'codeableConcept', getter: c => c.bodySite?.[0] }
  ]
}
