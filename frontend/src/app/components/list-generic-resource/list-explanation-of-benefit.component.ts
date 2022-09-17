import {Component, OnChanges, OnInit} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent, ResourceListComponentInterface} from './list-generic-resource.component';

@Component({
  selector: 'app-list-explanation-of-benefit',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListExplanationOfBenefitComponent extends ListGenericResourceComponent  {
  columnDefinitions: GenericColumnDefn[] = []
}
