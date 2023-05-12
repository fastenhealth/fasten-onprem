import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalSourcesFilterComponent } from './medical-sources-filter.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

describe('MedicalSourcesFilterComponent', () => {
  let component: MedicalSourcesFilterComponent;
  let fixture: ComponentFixture<MedicalSourcesFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
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
