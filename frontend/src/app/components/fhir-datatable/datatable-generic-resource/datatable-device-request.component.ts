import {Component} from '@angular/core';
import {GenericColumnDefn, DatatableGenericResourceComponent} from './datatable-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'fhir-datatable-device-request',
  templateUrl: './datatable-generic-resource.component.html',
  styleUrls: ['./datatable-generic-resource.component.scss']
})
export class DatatableDeviceRequestComponent extends DatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Device', versions: '*', format: 'codeableConcept', getter: d => d.codeCodeableConcept },
    { title: 'Author Date', versions: '*', format: 'date', getter: d => d.authoredOn },
    { title: 'Do Not Perform', versions: '*', getter: d => d.modifierExtension.doNotPerform },
    { title: 'Do Not Perform Reason', versions: '*', format: 'codeableConcept', getter: s => s.extension?.doNotPerformReason }

  ]
}
