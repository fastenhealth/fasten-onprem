import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportLabsComponent } from './report-labs.component';
import {FastenApiService} from '../../services/fasten-api.service';
import {of} from 'rxjs';
import {RouterTestingModule} from '@angular/router/testing';
import { ReportHeaderComponent } from 'src/app/components/report-header/report-header.component';
import { LoadingSpinnerComponent } from 'src/app/components/loading-spinner/loading-spinner.component';

describe('ReportLabsComponent', () => {
  let component: ReportLabsComponent;
  let fixture: ComponentFixture<ReportLabsComponent>;
  let mockedFastenApiService

  beforeEach(async () => {

    mockedFastenApiService = jasmine.createSpyObj('FastenApiService', ['getResources', 'queryResources'])
    await TestBed.configureTestingModule({
      declarations: [ ReportLabsComponent, ReportHeaderComponent ],
      imports: [RouterTestingModule, LoadingSpinnerComponent, RouterTestingModule],
      providers: [{
        provide: FastenApiService,
        useValue: mockedFastenApiService
      }]
    })
    .compileComponents();
    mockedFastenApiService.getResources.and.returnValue(of([]));
    mockedFastenApiService.queryResources.and.returnValue(of([]));

    fixture = TestBed.createComponent(ReportLabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
