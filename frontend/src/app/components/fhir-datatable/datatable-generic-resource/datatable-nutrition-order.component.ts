import {Component} from '@angular/core';
import {GenericColumnDefn, DatatableGenericResourceComponent} from './datatable-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'fhir-datatable-nutrition-order',
  templateUrl: './datatable-generic-resource.component.html',
  styleUrls: ['./datatable-generic-resource.component.scss']
})
export class DatatableNutritionOrderComponent extends DatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Preference', versions: '*', format: 'code', getter: n => n.foodPreferenceModifier?.[0].coding?.[0] },
    { title: 'Exclusion', versions: '*', format: 'code', getter: n => n.excludeFoodModifier?.[0].coding?.[0] },
    { title: 'Date', versions: '*', format: 'date', getter: n => n.dateTime },
    { title: 'Status', versions: '*', getter: n => n.status }
  ]
}
