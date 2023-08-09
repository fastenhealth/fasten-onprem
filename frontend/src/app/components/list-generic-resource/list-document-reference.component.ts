import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'app-list-document-reference',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListDocumentReferenceComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Date', versions: '*', format: 'date', getter: d => d.date },
    { title: 'Content', versions: '*', getter: d => d.content?.[0]?.attachment.title },
    { title: 'Category', versions: '*', format: 'codeableConcept', getter: d => d.category }, // Document category
    { title: 'Author', versions: '*', getter: d => d.author?.[0]?.display }, // Whoever creates the document

  ]
}
