import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FhirDatatableComponent } from './fhir-datatable.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {FhirDatatableOutletDirective} from './fhir-datatable-outlet.directive';
import {FastenApiService} from '../../../services/fasten-api.service';
import {HTTP_CLIENT_TOKEN} from '../../../dependency-injection';
import {HttpClient} from '@angular/common/http';

describe('ResourceListComponent', () => {
  let component: FhirDatatableComponent;
  let fixture: ComponentFixture<FhirDatatableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ FhirDatatableComponent, FhirDatatableOutletDirective ],
      providers: [
        FastenApiService,
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FhirDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
