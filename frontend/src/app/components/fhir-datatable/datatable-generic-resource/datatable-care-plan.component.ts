import {Component} from '@angular/core';
import {GenericColumnDefn, DatatableGenericResourceComponent} from './datatable-generic-resource.component';
import {attributeXTime} from './utils';

@Component({
  selector: 'fhir-datatable-care-plan',
  templateUrl: './datatable-generic-resource.component.html',
  styleUrls: ['./datatable-generic-resource.component.scss']
})
export class DatatableCarePlanComponent extends DatatableGenericResourceComponent {
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
