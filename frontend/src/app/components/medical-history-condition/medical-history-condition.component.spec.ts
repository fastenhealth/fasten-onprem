import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalHistoryConditionComponent } from './medical-history-condition.component';

describe('MedicalHistoryConditionComponent', () => {
  let component: MedicalHistoryConditionComponent;
  let fixture: ComponentFixture<MedicalHistoryConditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalHistoryConditionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalHistoryConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
