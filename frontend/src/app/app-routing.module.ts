import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { Routes, RouterModule } from "@angular/router";
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MedicalSourcesComponent } from './pages/medical-sources/medical-sources.component';
import {ResourceDetailComponent} from './pages/resource-detail/resource-detail.component';
import {AuthSigninComponent} from './pages/auth-signin/auth-signin.component';
import {AuthSignupComponent} from './pages/auth-signup/auth-signup.component';
import {IsAuthenticatedAuthGuard} from './auth-guards/is-authenticated-auth-guard';
import {SourceDetailComponent} from './pages/source-detail/source-detail.component';
import {PatientProfileComponent} from './pages/patient-profile/patient-profile.component';
import {MedicalHistoryComponent} from './pages/medical-history/medical-history.component';
import {ReportLabsComponent} from './pages/report-labs/report-labs.component';
import {ResourceCreatorComponent} from './pages/resource-creator/resource-creator.component';
import {ExploreComponent} from './pages/explore/explore.component';
import {environment} from '../environments/environment';
import {DesktopCallbackComponent} from './pages/desktop-callback/desktop-callback.component';

const routes: Routes = [

  { path: 'auth/signin', component: AuthSigninComponent },
  { path: 'auth/signin/callback/:idp_type', component: AuthSigninComponent },
  { path: 'auth/signup', component: AuthSignupComponent },
  { path: 'auth/signup/callback/:idp_type', component: AuthSignupComponent },

  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [ IsAuthenticatedAuthGuard] },

  //explore page will replace source/* pages
  { path: 'explore', component: ExploreComponent, canActivate: [ IsAuthenticatedAuthGuard] },
  { path: 'explore/:source_id', component: SourceDetailComponent, canActivate: [ IsAuthenticatedAuthGuard] },
  { path: 'explore/:source_id/resource/:resource_id', component: ResourceDetailComponent, canActivate: [ IsAuthenticatedAuthGuard] },
  { path: 'explore/:source_id/resource/:resource_type/:resource_id', component: ResourceDetailComponent, canActivate: [ IsAuthenticatedAuthGuard] },

  { path: 'sources', component: MedicalSourcesComponent, canActivate: [ IsAuthenticatedAuthGuard] },
  { path: 'sources/callback/:source_type', component: MedicalSourcesComponent, canActivate: [ IsAuthenticatedAuthGuard] },
  { path: 'resource/create', component: ResourceCreatorComponent, canActivate: [ IsAuthenticatedAuthGuard] },

  { path: 'desktop/callback/:source_id', component: DesktopCallbackComponent, canActivate: [ IsAuthenticatedAuthGuard] },

  { path: 'patient-profile', component: PatientProfileComponent, canActivate: [ IsAuthenticatedAuthGuard] },
  { path: 'medical-history', component: MedicalHistoryComponent, canActivate: [ IsAuthenticatedAuthGuard] },
  { path: 'labs', component: ReportLabsComponent, canActivate: [ IsAuthenticatedAuthGuard] },
  { path: 'labs/report/:source_id/:resource_type/:resource_id', component: ReportLabsComponent, canActivate: [ IsAuthenticatedAuthGuard] },

  // { path: 'general-pages', loadChildren: () => import('./general-pages/general-pages.module').then(m => m.GeneralPagesModule) },
  // { path: 'ui-elements', loadChildren: () => import('./ui-elements/ui-elements.module').then(m => m.UiElementsModule) },
  // { path: 'form', loadChildren: () => import('./form/form.module').then(m => m.FormModule) },
  // { path: 'charts', loadChildren: () => import('./charts/charts.module').then(m => m.ChartsDemoModule) },
  // { path: 'tables', loadChildren: () => import('./tables/tables.module').then(m => m.TablesModule) },
  { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes,  {useHash: environment.environment_desktop}),
    CommonModule,
    BrowserModule,
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
