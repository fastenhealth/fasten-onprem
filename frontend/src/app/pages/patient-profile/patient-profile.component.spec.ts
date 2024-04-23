import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientProfileComponent } from './patient-profile.component';
import {FastenApiService} from '../../services/fasten-api.service';
import {of} from 'rxjs';
import {PipesModule} from '../../pipes/pipes.module';
import { ReportHeaderComponent } from 'src/app/components/report-header/report-header.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('PatientProfileComponent', () => {
  let component: PatientProfileComponent;
  let fixture: ComponentFixture<PatientProfileComponent>;
  let mockedFastenApiService

  beforeEach(async () => {
    mockedFastenApiService = jasmine.createSpyObj('FastenApiService', ['getResources'])
    await TestBed.configureTestingModule({
      declarations: [ PatientProfileComponent, ReportHeaderComponent ],
      imports: [PipesModule, RouterTestingModule],
      providers: [{
        provide: FastenApiService,
        useValue: mockedFastenApiService
      }]
    })
    .compileComponents();
    mockedFastenApiService.getResources.and.returnValue(of([{}]));

    fixture = TestBed.createComponent(PatientProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
