import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportMedicalHistoryConditionComponent } from './report-medical-history-condition.component';
import {PipesModule} from '../../pipes/pipes.module';

describe('ReportMedicalHistoryConditionComponent', () => {
  let component: ReportMedicalHistoryConditionComponent;
  let fixture: ComponentFixture<ReportMedicalHistoryConditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportMedicalHistoryConditionComponent ],
      imports: [PipesModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportMedicalHistoryConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
