import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalRecordWizardEditLabResultsComponent } from './medical-record-wizard-edit-lab-results.component';
import { NlmClinicalTableSearchService } from 'src/app/services/nlm-clinical-table-search.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HTTP_CLIENT_TOKEN } from '../../dependency-injection';
import { HttpHandler } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('MedicalRecordWizardEditLabResultsComponent', () => {
  let component: MedicalRecordWizardEditLabResultsComponent;
  let fixture: ComponentFixture<MedicalRecordWizardEditLabResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MedicalRecordWizardEditLabResultsComponent, HttpClientTestingModule ],
      providers: [NgbActiveModal, NlmClinicalTableSearchService, {
        provide: HTTP_CLIENT_TOKEN,
        useClass: HttpHandler,
      }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalRecordWizardEditLabResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
