import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PractitionerComponent } from './practitioner.component';
import {NgbCollapseModule} from '@ng-bootstrap/ng-bootstrap';
import {RouterTestingModule} from '@angular/router/testing';

describe('PractitionerComponent', () => {
  let component: PractitionerComponent;
  let fixture: ComponentFixture<PractitionerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PractitionerComponent, NgbCollapseModule, RouterTestingModule]

    })
    .compileComponents();

    fixture = TestBed.createComponent(PractitionerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
