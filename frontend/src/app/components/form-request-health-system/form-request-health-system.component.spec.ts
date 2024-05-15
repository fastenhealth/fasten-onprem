import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormRequestHealthSystemComponent } from './form-request-health-system.component';

describe('FormRequestHealthSystemComponent', () => {
  let component: FormRequestHealthSystemComponent;
  let fixture: ComponentFixture<FormRequestHealthSystemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormRequestHealthSystemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormRequestHealthSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
