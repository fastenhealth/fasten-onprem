import {Component} from '@angular/core';
import {GenericColumnDefn, ListGenericResourceComponent} from './list-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'fhir-datatable-care-plan',
  templateUrl: './list-generic-resource.component.html',
  styleUrls: ['./list-generic-resource.component.scss']
})
export class ListCarePlanComponent extends ListGenericResourceComponent {
  columnDefinitions: GenericColumnDefn[] = [
    { title: 'Category', versions: '*', format: 'code', getter: c => c.category[0].coding[0] },
    { title: 'Reason', versions: '*', getter: c => {
        return (c.activity || []).map((a, i) => {
          let reason = a.detail?.code?.coding[0]?.display || ""
          return reason ? [reason, a.detail?.status || "no data"] : []
        })
      } },
    { title: 'Period', versions: '*', format: 'period', getter: c => c.period },
    { title: 'Status', versions: '*', getter: a => a.status },

  ]
}
