import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportMedicalHistoryExplanationOfBenefitComponent } from './report-medical-history-explanation-of-benefit.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('ReportMedicalHistoryExplanationOfBenefitComponent', () => {
  let component: ReportMedicalHistoryExplanationOfBenefitComponent;
  let fixture: ComponentFixture<ReportMedicalHistoryExplanationOfBenefitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportMedicalHistoryExplanationOfBenefitComponent ],
      imports: [ RouterTestingModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportMedicalHistoryExplanationOfBenefitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
