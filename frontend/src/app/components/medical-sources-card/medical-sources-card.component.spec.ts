import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalSourcesCardComponent } from './medical-sources-card.component';

describe('MedicalSourcesCardComponent', () => {
  let component: MedicalSourcesCardComponent;
  let fixture: ComponentFixture<MedicalSourcesCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalSourcesCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalSourcesCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
