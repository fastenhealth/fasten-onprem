import {Component} from '@angular/core';
import {GenericColumnDefn, DatatableGenericResourceComponent} from './datatable-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'fhir-datatable-document-reference',
  templateUrl: './datatable-generic-resource.component.html',
  styleUrls: ['./datatable-generic-resource.component.scss']
})
export class DatatableDocumentReferenceComponent extends DatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Date', versions: '*', format: 'date', getter: d => d.date },
    { title: 'Content', versions: '*', getter: d => d.content?.[0]?.attachment.title },
    { title: 'Category', versions: '*', format: 'codeableConcept', getter: d => d.type }, // Document category - This is more accurate. Previous mostly shows "unknown".
    { title: 'Author', versions: '*', getter: d => d.author?.[0]?.display }, // Whoever creates the document

  ]
}
