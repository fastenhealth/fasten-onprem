import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalHistoryComponent } from './medical-history.component';
import {FastenApiService} from '../../services/fasten-api.service';
import {HttpClient} from '@angular/common/http';
import {NgbModal, NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import {of} from 'rxjs';

describe('MedicalHistoryComponent', () => {
  let component: MedicalHistoryComponent;
  let fixture: ComponentFixture<MedicalHistoryComponent>;
  let mockedFastenApiService

  beforeEach(async () => {

    // httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    // fastenApiService = new FastenApiService(httpClientSpy, );
    mockedFastenApiService = jasmine.createSpyObj('FastenApiService', ['getResourceGraph'])
    await TestBed.configureTestingModule({
      declarations: [ MedicalHistoryComponent ],
      providers: [{
        provide: FastenApiService,
        useValue: mockedFastenApiService
      }, NgbModalModule]
    })
    .compileComponents();
    mockedFastenApiService.getResourceGraph.and.returnValue(of({"Condition":[],"Encounter":[]}));

    fixture = TestBed.createComponent(MedicalHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
