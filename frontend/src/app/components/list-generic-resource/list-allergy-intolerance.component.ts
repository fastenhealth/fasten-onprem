import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'app-list-allergy-intolerance',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListAllergyIntoleranceComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Date Recorded', versions: '*',  format: 'date', getter: a => a.assertedDate || a.recordedDate },
    { title: 'Allergy Type', versions: '*', getter: a => a.category[0] }, // Allergy Type
    { title: 'Allergic To', versions: '*', format: 'codeableConcept', getter: a => a.code }, // Substance
    { title: 'Reaction', versions: '*', getter: a => a.reaction[0].manifestation[0].text }, // Reaction
    { title: 'Onset', versions: '*', format: 'date', getter: a => a.onsetDateTime },
    { title: 'Resolution Age', versions: '*', format: 'date', getter: a => a.extension.resolutionAge },
  ]
}
