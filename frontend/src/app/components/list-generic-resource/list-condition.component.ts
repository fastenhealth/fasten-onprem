import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';

@Component({
  selector: 'app-list-condition',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListConditionComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Condition', versions: '*', format: 'code', getter: c => c.code.coding[0] },
    { title: 'Date of Onset', versions: '*', format: 'date', getter: c => c.onsetDateTime },
    { title: 'Date Resolved', 'versions': '*', format: 'date', getter: c => c.abatementDateTime, defaultValue: 'N/A' },
    { title: 'Recorded Date', versions: '*', format: 'date', getter: c => c.recordedDate },
    { title: 'Severity', versions: '*', format: 'code', getter: c => c.severity.coding[0] },
    { title: 'Body Site', versions: '*', format: 'code', getter: c => c.bodySite[0].coding[0] }
  ]
}
