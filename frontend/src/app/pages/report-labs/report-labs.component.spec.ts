import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportLabsComponent } from './report-labs.component';
import {FastenApiService} from '../../services/fasten-api.service';
import {NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import {of} from 'rxjs';

describe('ReportLabsComponent', () => {
  let component: ReportLabsComponent;
  let fixture: ComponentFixture<ReportLabsComponent>;
  let mockedFastenApiService

  beforeEach(async () => {

    mockedFastenApiService = jasmine.createSpyObj('FastenApiService', ['getResources'])
    await TestBed.configureTestingModule({
      declarations: [ ReportLabsComponent ],
      providers: [{
        provide: FastenApiService,
        useValue: mockedFastenApiService
      }]
    })
    .compileComponents();
    mockedFastenApiService.getResources.and.returnValue(of([]));

    fixture = TestBed.createComponent(ReportLabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
