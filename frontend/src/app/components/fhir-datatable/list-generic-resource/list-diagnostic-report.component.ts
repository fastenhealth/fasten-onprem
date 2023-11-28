import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'fhir-datatable-diagnostic-report',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListDiagnosticReportComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Issued', versions: '*', format: 'date', getter: d => d.issued },
    { title: 'Title', versions: '*', format: 'codeableConcept', getter: d => d.code },
    { title: 'Document Title', versions: '*', getter: d => d.presentedForm?.[0]?.title }, //Doc title
    { title: 'Author', versions: '*', getter: d => d.performer?.[0]?.display },

  ]
}
