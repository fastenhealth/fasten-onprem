import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllergyIntoleranceComponent } from './allergy-intolerance.component';
import {NgbCollapseModule} from '@ng-bootstrap/ng-bootstrap';
import {AuthService} from '../../../../services/auth.service';
import {RouterTestingModule} from '@angular/router/testing';

describe('AllergyIntoleranceComponent', () => {
  let component: AllergyIntoleranceComponent;
  let fixture: ComponentFixture<AllergyIntoleranceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllergyIntoleranceComponent, NgbCollapseModule, RouterTestingModule],
      providers: [AuthService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllergyIntoleranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
