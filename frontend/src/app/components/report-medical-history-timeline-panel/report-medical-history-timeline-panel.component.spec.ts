import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportMedicalHistoryTimelinePanelComponent } from './report-medical-history-timeline-panel.component';

describe('ReportMedicalHistoryTimelinePanelComponent', () => {
  let component: ReportMedicalHistoryTimelinePanelComponent;
  let fixture: ComponentFixture<ReportMedicalHistoryTimelinePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportMedicalHistoryTimelinePanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportMedicalHistoryTimelinePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
