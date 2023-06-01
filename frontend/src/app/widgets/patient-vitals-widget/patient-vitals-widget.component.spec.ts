import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientVitalsWidgetComponent } from './patient-vitals-widget.component';
import {FastenApiService} from '../../services/fasten-api.service';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {HttpClient} from '@angular/common/http';
import {RouterTestingModule} from '@angular/router/testing';

describe('PatientVitalsWidgetComponent', () => {
  let component: PatientVitalsWidgetComponent;
  let fixture: ComponentFixture<PatientVitalsWidgetComponent>;
  let mockedFastenApiService

  beforeEach(async () => {
    mockedFastenApiService = jasmine.createSpyObj('FastenApiService', ['queryResources'])

    await TestBed.configureTestingModule({
      imports: [ PatientVitalsWidgetComponent, RouterTestingModule ],
      providers: [
        {
          provide: FastenApiService,
          useValue: mockedFastenApiService
        },
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientVitalsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
