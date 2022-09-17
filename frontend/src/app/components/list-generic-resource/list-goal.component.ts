import {Component, OnChanges, OnInit} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent, ResourceListComponentInterface} from './list-generic-resource.component';

@Component({
  selector: 'app-list-goal',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListGoalComponent extends ListGenericResourceComponent  {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Description', versions: '*', getter: e => e.description.text },
    { title: 'Status', versions: '*', getter: e => e.lifecycleStatus },
    { title: 'Status Reason', versions: '*', getter: e => e.statusReason },
  ]
}
