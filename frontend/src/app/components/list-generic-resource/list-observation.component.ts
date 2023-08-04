import {Component} from '@angular/core';
import {attributeXTime, obsValue} from './utils';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';

@Component({
  selector: 'app-list-observation',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListObservationComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Issued Date', 'versions': '*', format: 'date', getter: o => o.issued },
    // { title: 'Effective', 'versions': '*', getter: o => attributeXTime(o,'effective') },
    { title: 'Effective', 'versions': '*', getter: o => attributeXTime(o,'effective') },
    { title: 'Observation', versions: '*', format: 'code', getter: o => o.code.coding[0] },
    { title: 'Value', versions: '*', getter: o => obsValue(o) },
    // { title: 'Issued Date', 'versions': '*', format: 'date', getter: o => o.issued },
    { title: 'ID', versions: '*', getter: o => o.id }
  ]
}
