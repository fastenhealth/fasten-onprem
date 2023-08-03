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
    { title: 'Allergy', versions: '*', getter: a => a.code.text }, // Allergy Name w/o Allergy Code
    { title: 'Date Recorded', versions: '*',  format: 'date', getter: a => a.assertedDate || a.recordedDate },
    { title: 'Onset', versions: '*', format: 'date', getter: a => a.onsetDateTime },
    { title: 'Resolution Age', versions: '*', format: 'date', getter: a => a.extension.resolutionAge }
  ]
}
