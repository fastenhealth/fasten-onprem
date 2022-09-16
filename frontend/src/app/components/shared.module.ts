import { NgModule } from '@angular/core';
import { ComponentsSidebarComponent } from './components-sidebar/components-sidebar.component';
import { RouterModule } from '@angular/router';
import { UtilitiesSidebarComponent } from './utilities-sidebar/utilities-sidebar.component';
import { ListPatientComponent } from './list-patient/list-patient.component';
import { ListObservationComponent } from './list-observation/list-observation.component';
import { ListExplanationOfBenefitComponent } from './list-explanation-of-benefit/list-explanation-of-benefit.component';
import { ListImmunizationComponent } from './list-immunization/list-immunization.component';
import { ListEncounterComponent } from './list-encounter/list-encounter.component';
import { ListConditionComponent } from './list-condition/list-condition.component';
import { ListCarePlanComponent } from './list-care-plan/list-care-plan.component';
import {BrowserModule} from '@angular/platform-browser';
import { ListGenericResourceComponent } from './list-generic-resource/list-generic-resource.component';

@NgModule({
  imports: [
    RouterModule,
    BrowserModule,
  ],
  declarations: [
    ComponentsSidebarComponent,
    UtilitiesSidebarComponent,
    ListPatientComponent,
    ListObservationComponent,
    ListExplanationOfBenefitComponent,
    ListImmunizationComponent,
    ListEncounterComponent,
    ListConditionComponent,
    ListCarePlanComponent,
    ListGenericResourceComponent
  ],
    exports: [
      ComponentsSidebarComponent,
      UtilitiesSidebarComponent,
      ListPatientComponent,
      ListObservationComponent,
      ListExplanationOfBenefitComponent,
      ListImmunizationComponent,
      ListEncounterComponent,
      ListConditionComponent,
      ListCarePlanComponent
    ]
})

export class SharedModule { }
