import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PractitionerEditPageComponent } from './practitioner-edit.component';

describe('PractitionerEditComponent', () => {
  let component: PractitionerEditPageComponent;
  let fixture: ComponentFixture<PractitionerEditPageComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [PractitionerEditPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PractitionerEditPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
