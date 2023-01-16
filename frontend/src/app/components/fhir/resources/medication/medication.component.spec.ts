import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicationComponent } from './medication.component';
import {NgbCollapseModule} from '@ng-bootstrap/ng-bootstrap';

describe('MedicationComponent', () => {
  let component: MedicationComponent;
  let fixture: ComponentFixture<MedicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicationComponent ],
      imports: [NgbCollapseModule]

    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
