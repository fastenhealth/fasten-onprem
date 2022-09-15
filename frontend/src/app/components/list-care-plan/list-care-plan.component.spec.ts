import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCarePlanComponent } from './list-care-plan.component';

describe('ListCarePlanComponent', () => {
  let component: ListCarePlanComponent;
  let fixture: ComponentFixture<ListCarePlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListCarePlanComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListCarePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
