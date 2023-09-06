import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicationRequestComponent } from './medication-request.component';
import {NgbCollapseModule} from '@ng-bootstrap/ng-bootstrap';
import {RouterTestingModule} from '@angular/router/testing';

describe('MedicationRequestComponent', () => {
  let component: MedicationRequestComponent;
  let fixture: ComponentFixture<MedicationRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicationRequestComponent, NgbCollapseModule, RouterTestingModule]

    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicationRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
