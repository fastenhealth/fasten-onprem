import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'app-list-nutrition-order',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListNutritionOrderComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Preference', versions: '*', format: 'code', getter: n => n.foodPreferenceModifier?.[0].coding?.[0] },
    { title: 'Exclusion', versions: '*', format: 'code', getter: n => n.excludeFoodModifier?.[0].coding?.[0] },
    { title: 'Date', versions: '*', format: 'date', getter: n => n.dateTime },
    { title: 'Status', versions: '*', getter: n => n.status }
  ]
}
