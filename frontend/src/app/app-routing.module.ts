import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule, Routes } from "@angular/router";
import { environment } from '../environments/environment';
import { IsAdminAuthGuard } from './auth-guards/is-admin-auth-guard';
import { IsAuthenticatedAuthGuard } from './auth-guards/is-authenticated-auth-guard';
import { ShowFirstRunWizardGuard } from './auth-guards/show-first-run-wizard-guard';
import { AuthSigninComponent } from './pages/auth-signin/auth-signin.component';
import { AuthSignupWizardComponent } from './pages/auth-signup-wizard/auth-signup-wizard.component';
import { AuthSignupComponent } from './pages/auth-signup/auth-signup.component';
import { BackgroundJobsComponent } from './pages/background-jobs/background-jobs.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DesktopCallbackComponent } from './pages/desktop-callback/desktop-callback.component';
import { ExploreComponent } from './pages/explore/explore.component';
import { MedicalHistoryComponent } from './pages/medical-history/medical-history.component';
import { MedicalSourcesComponent } from './pages/medical-sources/medical-sources.component';
import { PatientProfileComponent } from './pages/patient-profile/patient-profile.component';
import { ReportLabsComponent } from './pages/report-labs/report-labs.component';
import { ResourceCreatorComponent } from './pages/resource-creator/resource-creator.component';
import { ResourceDetailComponent } from './pages/resource-detail/resource-detail.component';
import { SourceDetailComponent } from './pages/source-detail/source-detail.component';
import { UserCreateComponent } from './pages/user-create/user-create.component';
import { UserListComponent } from './pages/user-list/user-list.component';
import { ViewRawResourceDetailsComponent } from "./pages/view-raw-resource-details/view-raw-resource-details.component";
import { ResourceSearchTableComponent } from "./pages/resource-search-table/resource-search-table.component";

const routes: Routes = [

  { path: 'auth/signup/wizard', component: AuthSignupWizardComponent },

  { path: 'auth/signin', component: AuthSigninComponent, canActivate: [ ShowFirstRunWizardGuard] },
  { path: 'auth/signin/callback/:idp_type', component: AuthSigninComponent },
  { path: 'auth/signup', component: AuthSignupComponent, canActivate: [ ShowFirstRunWizardGuard] },
  { path: 'auth/signup/callback/:idp_type', component: AuthSignupComponent },

  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [ IsAuthenticatedAuthGuard] },

  //explore page will replace source/* pages
  { path: 'explore', component: ExploreComponent, canActivate: [ IsAuthenticatedAuthGuard] },
  { path: 'explore/:source_id', component: SourceDetailComponent, canActivate: [ IsAuthenticatedAuthGuard] },
  { path: 'explore/:source_id/resource/:resource_id', component: ResourceDetailComponent, canActivate: [ IsAuthenticatedAuthGuard] },
  { path: 'explore/:source_id/resource/:resource_type/:resource_id', component: ResourceDetailComponent, canActivate: [ IsAuthenticatedAuthGuard] },

  { path: 'sources', component: MedicalSourcesComponent, canActivate: [ IsAuthenticatedAuthGuard] },
  { path: 'sources/callback/:state', component: MedicalSourcesComponent, canActivate: [ IsAuthenticatedAuthGuard] },
  { path: 'resource/create', component: ResourceCreatorComponent, canActivate: [ IsAuthenticatedAuthGuard] },
  { path: 'resource/summary', component: ResourceSearchTableComponent, canActivate: [ IsAuthenticatedAuthGuard] },
  { path: 'resource/view/:id',component: ViewRawResourceDetailsComponent, canActivate: [ IsAuthenticatedAuthGuard]},

  { path: 'desktop/callback/:state', component: DesktopCallbackComponent, canActivate: [ IsAuthenticatedAuthGuard] },

  { path: 'background-jobs', component: BackgroundJobsComponent, canActivate: [ IsAuthenticatedAuthGuard] },
  { path: 'patient-profile', component: PatientProfileComponent, canActivate: [ IsAuthenticatedAuthGuard] },
  { path: 'medical-history', component: MedicalHistoryComponent, canActivate: [ IsAuthenticatedAuthGuard] },
  { path: 'labs', component: ReportLabsComponent, canActivate: [ IsAuthenticatedAuthGuard] },
  { path: 'labs/report/:source_id/:resource_type/:resource_id', component: ReportLabsComponent, canActivate: [ IsAuthenticatedAuthGuard] },

  { path: 'users', component: UserListComponent, canActivate: [ IsAuthenticatedAuthGuard, IsAdminAuthGuard ] },
  { path: 'users/new', component: UserCreateComponent, canActivate: [ IsAuthenticatedAuthGuard, IsAdminAuthGuard ] },

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
