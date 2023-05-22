import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
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
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
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

@NgModule({
  declarations: [
    AppComponent,
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
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    FontAwesomeModule,
    SharedModule,
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
    WidgetsModule
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
    IsAuthenticatedAuthGuard,
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
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas, far);
  }
}
