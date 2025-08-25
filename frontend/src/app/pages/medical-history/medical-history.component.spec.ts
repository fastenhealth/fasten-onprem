import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalHistoryComponent } from './medical-history.component';
import {FastenApiService} from '../../services/fasten-api.service';
import {NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import {of} from 'rxjs';
import { ReportHeaderComponent } from 'src/app/components/report-header/report-header.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('MedicalHistoryComponent', () => {
  let component: MedicalHistoryComponent;
  let fixture: ComponentFixture<MedicalHistoryComponent>;
  let mockedFastenApiService

  beforeEach(async () => {

    mockedFastenApiService = jasmine.createSpyObj('FastenApiService', ['getResources', 'getResourceGraph', 'getSummary'])
    await TestBed.configureTestingModule({
      declarations: [ MedicalHistoryComponent, ReportHeaderComponent ],
      imports: [ RouterTestingModule, HttpClientTestingModule ],
      providers: [{
        provide: FastenApiService,
        useValue: mockedFastenApiService
      }, NgbModalModule]
    })
    .compileComponents();
    mockedFastenApiService.getResourceGraph.and.returnValue(of({"Condition":[],"Encounter":[]}));
    mockedFastenApiService.getResources.and.returnValue(of([]));
    mockedFastenApiService.getSummary.and.returnValue(of({sources: []}));

    fixture = TestBed.createComponent(MedicalHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
