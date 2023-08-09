import {Component, OnInit} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent, ResourceListComponentInterface} from './list-generic-resource.component';
import {FORMATTERS} from './utils';

@Component({
  selector: 'app-list-condition',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListConditionComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Condition', versions: '*', format: 'codeableConcept', getter: c => c.code },
    { title: 'Date of Onset', versions: '*', format: 'date', getter: c => c.onsetDateTime },
    { title: 'Date Resolved', 'versions': '*', format: 'date', getter: c => c.abatementDateTime, defaultValue: 'N/A' },
    { title: 'Recorded Date', versions: '*', format: 'date', getter: c => c.recordedDate },
    { title: 'Severity', versions: '*', format: 'codeableConcept', getter: c => c.severity },
    { title: 'Body Site', versions: '*', format: 'codeableConcept', getter: c => c.bodySite?.[0] }
  ]
}
