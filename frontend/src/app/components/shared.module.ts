import { NgModule } from '@angular/core';
import { ComponentsSidebarComponent } from './components-sidebar/components-sidebar.component';
import { RouterModule } from '@angular/router';
import { UtilitiesSidebarComponent } from './utilities-sidebar/utilities-sidebar.component';
import { ListPatientComponent } from './list-patient/list-patient.component';
import { ListExplanationOfBenefitComponent } from './list-explanation-of-benefit/list-explanation-of-benefit.component';
import { ListCarePlanComponent } from './list-care-plan/list-care-plan.component';
import {BrowserModule} from '@angular/platform-browser';
import { ListGenericResourceComponent,} from './list-generic-resource/list-generic-resource.component';
import {ListConditionComponent} from './list-generic-resource/list-condition.component'
import {ListEncounterComponent} from './list-generic-resource/list-encounter.component'
import {ListMedicationComponent} from './list-generic-resource/list-medication.component'
import {ListObservationComponent} from './list-generic-resource/list-observation.component'
import {ListProcedureComponent} from './list-generic-resource/list-procedure.component'
import {ListImmunizationComponent} from './list-generic-resource/list-immunization.component'
import {ListMedicationRequestComponent} from './list-generic-resource/list-medication-request.component'

import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
  imports: [
    RouterModule,
    BrowserModule,
    NgxDatatableModule
  ],
  declarations: [
    ComponentsSidebarComponent,
    UtilitiesSidebarComponent,
    ListPatientComponent,
    ListObservationComponent,
    ListExplanationOfBenefitComponent,
    ListImmunizationComponent,
    ListEncounterComponent,
    ListCarePlanComponent,
    ListGenericResourceComponent,
    ListMedicationComponent,
    ListProcedureComponent,
    ListConditionComponent,
    ListMedicationRequestComponent
  ],
    exports: [
      ComponentsSidebarComponent,
      UtilitiesSidebarComponent,
      ListPatientComponent,
      ListExplanationOfBenefitComponent,
      ListImmunizationComponent,
      ListEncounterComponent,
      ListCarePlanComponent,
      ListGenericResourceComponent,
      ListMedicationComponent,
      ListObservationComponent,
      ListProcedureComponent,
      ListConditionComponent,
      ListMedicationRequestComponent

    ]
})

export class SharedModule { }
