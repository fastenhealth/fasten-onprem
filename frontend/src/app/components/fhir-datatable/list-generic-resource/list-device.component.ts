import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'fhir-datatable-device',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListDeviceComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Device', versions: '*', getter: d => d.deviceName?.[0]?.name || d.type?.coding?.[0]?.display || d.type?.text },
    { title: 'Manufacturer', versions: '*', getter: d => d.manufacturer },
    { title: 'Model', versions: '*', getter: d => d.modelNumber },
    { title: 'Type', versions: '*', format: 'codeableConcept', getter: d => d.type },
    { title: 'Unique ID', versions: '*', getter: d => d.udi?.name || d.udiCarrier?.deviceIdentifier },
  ]
}
