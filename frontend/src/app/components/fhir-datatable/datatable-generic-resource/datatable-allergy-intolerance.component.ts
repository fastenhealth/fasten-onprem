import {Component} from '@angular/core';
import {GenericColumnDefn, DatatableGenericResourceComponent} from './datatable-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'fhir-datatable-allergy-intolerance',
  templateUrl: './datatable-generic-resource.component.html',
  styleUrls: ['./datatable-generic-resource.component.scss']
})
export class DatatableAllergyIntoleranceComponent extends DatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Date Recorded', versions: '*',  format: 'date', getter: a => a.assertedDate || a.recordedDate },
    { title: 'Allergy Type', versions: '*', getter: a => a.category[0] }, // Allergy Type
    { title: 'Allergic To', versions: '*', format: 'codeableConcept', getter: a => a.code }, // Substance
    { title: 'Reaction', versions: '*', getter: a => a.reaction[0].manifestation[0].text }, // Reaction
    { title: 'Onset', versions: '*', format: 'date', getter: a => a.onsetDateTime },
    { title: 'Resolution Age', versions: '*', format: 'date', getter: a => a.extension.resolutionAge },
  ]
}
