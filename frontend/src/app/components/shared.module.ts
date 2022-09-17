import { ComponentsSidebarComponent } from './components-sidebar/components-sidebar.component';
import { ListExplanationOfBenefitComponent } from './list-explanation-of-benefit/list-explanation-of-benefit.component';
import { ListGenericResourceComponent,} from './list-generic-resource/list-generic-resource.component';
import { ListPatientComponent } from './list-patient/list-patient.component';
import { NgModule } from '@angular/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { RouterModule } from '@angular/router';
import { UtilitiesSidebarComponent } from './utilities-sidebar/utilities-sidebar.component';
import {BrowserModule} from '@angular/platform-browser';
import {ListAdverseEventComponent} from './list-generic-resource/list-adverse-event.component';
import {ListConditionComponent} from './list-generic-resource/list-condition.component'
import {ListEncounterComponent} from './list-generic-resource/list-encounter.component'
import {ListImmunizationComponent} from './list-generic-resource/list-immunization.component'
import {ListMedicationAdministrationComponent} from './list-generic-resource/list-medication-administration.component';
import {ListMedicationComponent} from './list-generic-resource/list-medication.component'
import {ListMedicationDispenseComponent} from './list-generic-resource/list-medication-dispense.component';
import {ListMedicationRequestComponent} from './list-generic-resource/list-medication-request.component'
import {ListNutritionOrderComponent} from './list-generic-resource/list-nutrition-order.component';
import {ListObservationComponent} from './list-generic-resource/list-observation.component'
import {ListProcedureComponent} from './list-generic-resource/list-procedure.component'
import {ListCommunicationComponent} from './list-generic-resource/list-communication.component';
import {ListDeviceRequestComponent} from './list-generic-resource/list-device-request.component';
import {ListCoverageComponent} from './list-generic-resource/list-coverage.component';
import {ListServiceRequestComponent} from './list-generic-resource/list-service-request.component';
import {ListDocumentReferenceComponent} from './list-generic-resource/list-document-reference.component';
import { ResourceListComponent } from './resource-list/resource-list.component';
import {ResourceListOutletDirective} from '../directive/resource-list-outlet.directive';
import {ListCarePlanComponent} from './list-generic-resource/list-care-plan.component';
import {ListAllergyIntoleranceComponent} from './list-generic-resource/list-allergy-intolerance.component';

@NgModule({
  imports: [
    RouterModule,
    BrowserModule,
    NgxDatatableModule,
  ],
  declarations: [
    ComponentsSidebarComponent,
    UtilitiesSidebarComponent,
    ListAllergyIntoleranceComponent,
    ListAdverseEventComponent,
    ListCarePlanComponent,
    ListCommunicationComponent,
    ListConditionComponent,
    ListEncounterComponent,
    ListExplanationOfBenefitComponent,
    ListGenericResourceComponent,
    ListImmunizationComponent,
    ListMedicationAdministrationComponent,
    ListMedicationComponent,
    ListMedicationDispenseComponent,
    ListMedicationRequestComponent,
    ListNutritionOrderComponent,
    ListObservationComponent,
    ListPatientComponent,
    ListDeviceRequestComponent,
    ListProcedureComponent,
    ListCoverageComponent,
    ListServiceRequestComponent,
    ListDocumentReferenceComponent,
    ResourceListComponent,
    ResourceListOutletDirective,


  ],
    exports: [
        ComponentsSidebarComponent,
        ListAllergyIntoleranceComponent,
        ListAdverseEventComponent,
        ListCarePlanComponent,
        ListCommunicationComponent,
        ListConditionComponent,
        ListEncounterComponent,
        ListExplanationOfBenefitComponent,
        ListGenericResourceComponent,
        ListImmunizationComponent,
        ListMedicationAdministrationComponent,
        ListMedicationComponent,
        ListMedicationDispenseComponent,
        ListMedicationRequestComponent,
        ListNutritionOrderComponent,
        ListObservationComponent,
        ListPatientComponent,
        ListProcedureComponent,
        ListDeviceRequestComponent,
        UtilitiesSidebarComponent,
        ListCoverageComponent,
        ListServiceRequestComponent,
        ListDocumentReferenceComponent,
        ResourceListComponent
    ]
})

export class SharedModule { }
