import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SettingsService } from './services/settings.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HttpClientModule, HTTP_INTERCEPTORS, HttpClient} from '@angular/common/http';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MedicalSourcesComponent } from './pages/medical-sources/medical-sources.component';
import { NgChartsModule } from 'ng2-charts';
import {SharedModule} from './components/shared.module';
import { ResourceDetailComponent } from './pages/resource-detail/resource-detail.component';
import { AuthSignupComponent } from './pages/auth-signup/auth-signup.component';
import { AuthSigninComponent } from './pages/auth-signin/auth-signin.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { IsAuthenticatedAuthGuard } from './auth-guards/is-authenticated-auth-guard';
import {Router} from '@angular/router';
import { SourceDetailComponent } from './pages/source-detail/source-detail.component';
import { HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import {AuthInterceptorService} from './services/auth-interceptor.service';
import { MomentModule } from 'ngx-moment';
import {AuthService} from './services/auth.service';
import { PatientProfileComponent } from './pages/patient-profile/patient-profile.component';
import { MedicalHistoryComponent } from './pages/medical-history/medical-history.component';
import { ReportLabsComponent } from './pages/report-labs/report-labs.component';
import {PipesModule} from './pipes/pipes.module';
import { ResourceCreatorComponent } from './pages/resource-creator/resource-creator.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgSelectModule } from '@ng-select/ng-select';
import {HTTP_CLIENT_TOKEN} from "./dependency-injection";
import {WidgetsModule} from './widgets/widgets.module';
import { ExploreComponent } from './pages/explore/explore.component';
import {DirectivesModule} from './directives/directives.module';
import { DesktopCallbackComponent } from './pages/desktop-callback/desktop-callback.component';
import { BackgroundJobsComponent } from './pages/background-jobs/background-jobs.component';
import {FhirCardModule} from './components/fhir-card/fhir-card.module';
import {FhirDatatableModule} from './components/fhir-datatable/fhir-datatable.module';
import { AuthSignupWizardComponent } from './pages/auth-signup-wizard/auth-signup-wizard.component';
import {ShowFirstRunWizardGuard} from './auth-guards/show-first-run-wizard-guard';
import { IconsModule } from './icon-module';
import { UserListComponent } from './pages/user-list/user-list.component';
import { PractitionerHistoryComponent } from './pages/practitioner-history/practitioner-history.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { ViewRawResourceDetailsComponent } from './pages/view-raw-resource-details/view-raw-resource-details.component';
import { ResourceSearchTableComponent } from './pages/resource-search-table/resource-search-table.component';
import { ResourceSearchDatatableModule } from './components/resource-search-datatable/resource-search-datatable.module';
import { ChatComponent } from './pages/chat/chat.component';

@NgModule({
  declarations: [
    AppComponent,
    SettingsComponent,
    HeaderComponent,
    FooterComponent,
    DashboardComponent,
    MedicalSourcesComponent,
    ResourceDetailComponent,
    AuthSignupComponent,
    AuthSigninComponent,
    SourceDetailComponent,
    PatientProfileComponent,
    MedicalHistoryComponent,
    ReportLabsComponent,
    ResourceCreatorComponent,
    ExploreComponent,
    DesktopCallbackComponent,
    BackgroundJobsComponent,
    AuthSignupWizardComponent,
    UserListComponent,
    PractitionerHistoryComponent,
    ViewRawResourceDetailsComponent,
    ResourceSearchTableComponent,
    ChatComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    SharedModule,
    FhirCardModule,
    FhirDatatableModule,
    ResourceSearchDatatableModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    NgChartsModule,
    NgxDropzoneModule,
    HighlightModule,
    MomentModule,
    PipesModule,
    InfiniteScrollModule,
    NgSelectModule,
    WidgetsModule,
    DirectivesModule,
    IconsModule,
  ],
  providers: [
    {
      provide: HTTP_CLIENT_TOKEN,
      useClass: HttpClient,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
      deps: [AuthService, Router]
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (settingsService: SettingsService) => () => settingsService.load(),
      deps: [SettingsService],
      multi: true
    },
    IsAuthenticatedAuthGuard,
    ShowFirstRunWizardGuard,
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        lineNumbersLoader: () => import('highlightjs-line-numbers.js'), // Optional, only if you want the line numbers
        languages: {
          json: () => import('highlight.js/lib/languages/json')
        },
      }
    }
  ],
  exports: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] //required for lhncbc/lforms (webcomponent)
})
export class AppModule {}
