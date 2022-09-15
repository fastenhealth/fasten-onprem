import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListExplanationOfBenefitComponent } from './list-explanation-of-benefit.component';

describe('ListExplanationOfBenefitComponent', () => {
  let component: ListExplanationOfBenefitComponent;
  let fixture: ComponentFixture<ListExplanationOfBenefitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListExplanationOfBenefitComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListExplanationOfBenefitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
