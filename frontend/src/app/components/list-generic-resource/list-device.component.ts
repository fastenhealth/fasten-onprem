import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'app-list-device',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListDeviceComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Device', versions: '*', getter: d => d.model },
    { title: 'Type', versions: '*', format: 'date', getter: d => d.type.coding[0] },
    { title: 'Unique ID', versions: '*', getter: d => d.udi?.name || d.udiCarrier?.deviceIdentifier },
  ]
}
