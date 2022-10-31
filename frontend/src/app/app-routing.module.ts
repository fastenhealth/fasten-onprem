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
import {EncryptionEnabledAuthGuard} from './auth-guards/encryption-enabled.auth-guard';
import {SourceDetailComponent} from './pages/source-detail/source-detail.component';
import {EncryptionManagerComponent} from './pages/encryption-manager/encryption-manager.component';

const routes: Routes = [

  { path: 'auth/signin', component: AuthSigninComponent },
  { path: 'auth/signin/callback/:idp_type', component: AuthSigninComponent },
  { path: 'auth/signup', component: AuthSignupComponent },
  { path: 'auth/signup/callback/:idp_type', component: AuthSignupComponent },

  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [ IsAuthenticatedAuthGuard, EncryptionEnabledAuthGuard] },
  { path: 'source/:source_id', component: SourceDetailComponent, canActivate: [ IsAuthenticatedAuthGuard, EncryptionEnabledAuthGuard] },
  { path: 'resource/:resource_id', component: ResourceDetailComponent, canActivate: [ IsAuthenticatedAuthGuard, EncryptionEnabledAuthGuard] },
  { path: 'sources', component: MedicalSourcesComponent, canActivate: [ IsAuthenticatedAuthGuard, EncryptionEnabledAuthGuard] },
  { path: 'sources/callback/:source_type', component: MedicalSourcesComponent, canActivate: [ IsAuthenticatedAuthGuard, EncryptionEnabledAuthGuard] },

  { path: 'account/security/manager', component: EncryptionManagerComponent, canActivate: [ IsAuthenticatedAuthGuard] },


  // { path: 'general-pages', loadChildren: () => import('./general-pages/general-pages.module').then(m => m.GeneralPagesModule) },
  // { path: 'ui-elements', loadChildren: () => import('./ui-elements/ui-elements.module').then(m => m.UiElementsModule) },
  // { path: 'form', loadChildren: () => import('./form/form.module').then(m => m.FormModule) },
  // { path: 'charts', loadChildren: () => import('./charts/charts.module').then(m => m.ChartsDemoModule) },
  // { path: 'tables', loadChildren: () => import('./tables/tables.module').then(m => m.TablesModule) },
  { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    CommonModule,
    BrowserModule,
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
