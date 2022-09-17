import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'app-list-diagnostic-report',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListDiagnosticReportComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Code', versions: '*', format: 'code', getter: d => d.code.coding[0] },
    { title: 'Issued', versions: '*', format: 'date', getter: d => d.issued },
    { title: 'Performer', versions: '*', getter: d => d.performer.display },
  ]
}
