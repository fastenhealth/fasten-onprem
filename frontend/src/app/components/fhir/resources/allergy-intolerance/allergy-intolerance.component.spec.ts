import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllergyIntoleranceComponent } from './allergy-intolerance.component';
import {NgbCollapseModule} from '@ng-bootstrap/ng-bootstrap';

describe('AllergyIntoleranceComponent', () => {
  let component: AllergyIntoleranceComponent;
  let fixture: ComponentFixture<AllergyIntoleranceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllergyIntoleranceComponent ],
      imports: [NgbCollapseModule]
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
