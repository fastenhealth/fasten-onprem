import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelegatedSourceDetailComponent } from './delegated-source-detail.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {ActivatedRoute, convertToParamMap, RouterModule} from '@angular/router';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {HttpClient} from '@angular/common/http';
import { FhirDatatableModule } from 'src/app/components/fhir-datatable/fhir-datatable.module';

describe('DelegatedSourceDetailComponent', () => {
  let component: DelegatedSourceDetailComponent;
  let fixture: ComponentFixture<DelegatedSourceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, RouterModule, FhirDatatableModule],
      declarations: [ DelegatedSourceDetailComponent ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {snapshot: {paramMap: convertToParamMap( { 'source_id': 'b64.c291cmNlOmF0aGVuYTphLTgwMDAwLkUtMTQ1NDU' } )}}
        },
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DelegatedSourceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
