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
   // orig { title: 'Condition', versions: '*', format: 'code', getter: c => c.code.coding[0] },
    { title: 'Condition', versions: '*', getter: c => c.code.text },
    { title: 'Date of Onset', versions: '*', format: 'date', getter: c => c.onsetDateTime },
    { title: 'Date Resolved', 'versions': '*', format: 'date', getter: c => c.abatementDateTime, defaultValue: 'N/A' },
    { title: 'Recorded Date', versions: '*', format: 'date', getter: c => c.recordedDate },
    { title: 'Severity', versions: '*', format: 'code', getter: c => c.severity.coding[0] },
    { title: 'Body Site', versions: '*', format: 'code', getter: c => c.bodySite[0].coding[0] }
  ]
}
