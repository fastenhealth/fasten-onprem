import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'app-list-location',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListLocationComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Name', versions: '*', getter: d => d.name || d.alias },
    { title: 'Organization', versions: '*', getter: d => d.managingOrganization?.display },
    { title: 'Type', versions: '*', format: 'codeableConcept', getter: d => d.physicalType },
    { title: 'Address', versions: '*', format: 'address', getter: d => d.address },
  ]
}
