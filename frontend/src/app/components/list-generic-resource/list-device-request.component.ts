import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'app-list-device-request',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListDeviceRequestComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Device', versions: '*', format: 'code', getter: d => d.codeCodeableConcept.coding[0] },
    { title: 'Author Date', versions: '*', format: 'date', getter: d => d.authoredOn },
    { title: 'Do Not Perform', versions: '*', getter: d => d.modifierExtension.doNotPerform },
    { title: 'Do Not Perform Reason', versions: '*', format: 'code', getter: s => s.extension.doNotPerformReason.coding[0] }

  ]
}
