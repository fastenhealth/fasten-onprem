import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalRecordWizardAddLabResultsComponent } from './medical-record-wizard-add-lab-results.component';
import { NlmClinicalTableSearchService } from 'src/app/services/nlm-clinical-table-search.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HTTP_CLIENT_TOKEN } from '../../dependency-injection';
import { HttpHandler } from '@angular/common/http';

describe('MedicalRecordWizardAddLabResultsComponent', () => {
  let component: MedicalRecordWizardAddLabResultsComponent;
  let fixture: ComponentFixture<MedicalRecordWizardAddLabResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MedicalRecordWizardAddLabResultsComponent ],
      providers: [NgbActiveModal, NlmClinicalTableSearchService, {
        provide: HTTP_CLIENT_TOKEN,
        useClass: HttpHandler,
      }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalRecordWizardAddLabResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
