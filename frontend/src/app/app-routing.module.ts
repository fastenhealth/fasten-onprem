import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { Routes, RouterModule } from "@angular/router";
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MedicalSourcesComponent } from './pages/medical-sources/medical-sources.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'sources', component: MedicalSourcesComponent },
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
