import {Component, OnChanges, OnInit} from '@angular/core';
import {GenericColumnDefn, DatatableGenericResourceComponent, ResourceListComponentInterface} from './datatable-generic-resource.component';

@Component({
  selector: 'fhir-datatable-explanation-of-benefit',
  templateUrl: './datatable-generic-resource.component.html',
  styleUrls: ['./datatable-generic-resource.component.scss']
})
export class DatatableExplanationOfBenefitComponent extends DatatableGenericResourceComponent  {
  columnDefinitions: GenericColumnDefn[] = []
}
