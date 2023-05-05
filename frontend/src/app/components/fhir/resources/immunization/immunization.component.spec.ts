import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImmunizationComponent } from './immunization.component';
import {NgbCollapseModule} from '@ng-bootstrap/ng-bootstrap';

describe('ImmunizationComponent', () => {
  let component: ImmunizationComponent;
  let fixture: ComponentFixture<ImmunizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImmunizationComponent, NgbCollapseModule]

    })
    .compileComponents();

    fixture = TestBed.createComponent(ImmunizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
