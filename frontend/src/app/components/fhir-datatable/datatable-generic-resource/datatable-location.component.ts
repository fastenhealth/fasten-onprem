import {Component} from '@angular/core';
import {GenericColumnDefn, DatatableGenericResourceComponent} from './datatable-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'fhir-datatable-location',
  templateUrl: './datatable-generic-resource.component.html',
  styleUrls: ['./datatable-generic-resource.component.scss']
})
export class DatatableLocationComponent extends DatatableGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Name', versions: '*', getter: d => d.name || d.alias },
    { title: 'Organization', versions: '*', getter: d => d.managingOrganization?.display },
    { title: 'Type', versions: '*', format: 'codeableConcept', getter: d => d.physicalType },
    { title: 'Address', versions: '*', format: 'address', getter: d => d.address },
  ]
}
