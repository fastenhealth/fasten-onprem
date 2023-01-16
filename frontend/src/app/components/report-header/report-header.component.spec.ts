import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportHeaderComponent } from './report-header.component';
import {FastenApiService} from '../../services/fasten-api.service';
import {NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import {of} from 'rxjs';

describe('ReportHeaderComponent', () => {
  let component: ReportHeaderComponent;
  let fixture: ComponentFixture<ReportHeaderComponent>;
  let mockedFastenApiService

  beforeEach(async () => {
    mockedFastenApiService = jasmine.createSpyObj('FastenApiService', ['getResources'])

    await TestBed.configureTestingModule({
      declarations: [ ReportHeaderComponent ],
      providers: [{
        provide: FastenApiService,
        useValue: mockedFastenApiService
      }]
    })
    .compileComponents();
    mockedFastenApiService.getResources.and.returnValue(of({}));

    fixture = TestBed.createComponent(ReportHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
