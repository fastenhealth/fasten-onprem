import {Component, OnChanges, OnInit} from '@angular/core';
import {GenericColumnDefn, DatatableGenericResourceComponent, ResourceListComponentInterface} from './datatable-generic-resource.component';

@Component({
  selector: 'fhir-datatable-goal',
  templateUrl: './datatable-generic-resource.component.html',
  styleUrls: ['./datatable-generic-resource.component.scss']
})
export class DatatableGoalComponent extends DatatableGenericResourceComponent  {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Description', versions: '*', getter: e => e.description.text },
    { title: 'Status', versions: '*', getter: e => e.lifecycleStatus },
    { title: 'Status Reason', versions: '*', getter: e => e.statusReason },
  ]
}
