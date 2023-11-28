import {Component} from '@angular/core';
import {GenericColumnDefn, DatatableGenericResourceComponent} from './datatable-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'fhir-datatable-diagnostic-report',
  templateUrl: './datatable-generic-resource.component.html',
  styleUrls: ['./datatable-generic-resource.component.scss']
})
export class DatatableDiagnosticReportComponent extends DatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Issued', versions: '*', format: 'date', getter: d => d.issued },
    { title: 'Title', versions: '*', format: 'codeableConcept', getter: d => d.code },
    { title: 'Document Title', versions: '*', getter: d => d.presentedForm?.[0]?.title }, //Doc title
    { title: 'Author', versions: '*', getter: d => d.performer?.[0]?.display },

  ]
}
