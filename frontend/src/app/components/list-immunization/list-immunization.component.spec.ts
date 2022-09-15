import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListImmunizationComponent } from './list-immunization.component';

describe('ListImmunizationComponent', () => {
  let component: ListImmunizationComponent;
  let fixture: ComponentFixture<ListImmunizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListImmunizationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListImmunizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
