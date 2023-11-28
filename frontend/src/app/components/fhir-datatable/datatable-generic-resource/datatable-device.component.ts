import {Component} from '@angular/core';
import {GenericColumnDefn, DatatableGenericResourceComponent} from './datatable-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'fhir-datatable-device',
  templateUrl: './datatable-generic-resource.component.html',
  styleUrls: ['./datatable-generic-resource.component.scss']
})
export class DatatableDeviceComponent extends DatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Device', versions: '*', getter: d => d.deviceName?.[0]?.name || d.type?.coding?.[0]?.display || d.type?.text },
    { title: 'Manufacturer', versions: '*', getter: d => d.manufacturer },
    { title: 'Model', versions: '*', getter: d => d.modelNumber },
    { title: 'Type', versions: '*', format: 'codeableConcept', getter: d => d.type },
    { title: 'Unique ID', versions: '*', getter: d => d.udi?.name || d.udiCarrier?.deviceIdentifier },
  ]
}
