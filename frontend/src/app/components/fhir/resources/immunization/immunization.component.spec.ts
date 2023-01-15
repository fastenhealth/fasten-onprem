import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImmunizationComponent } from './immunization.component';

describe('ImmunizationComponent', () => {
  let component: ImmunizationComponent;
  let fixture: ComponentFixture<ImmunizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImmunizationComponent ]
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
