import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalSourcesFilterComponent } from './medical-sources-filter.component';

describe('MedicalSourcesFilterComponent', () => {
  let component: MedicalSourcesFilterComponent;
  let fixture: ComponentFixture<MedicalSourcesFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalSourcesFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalSourcesFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
