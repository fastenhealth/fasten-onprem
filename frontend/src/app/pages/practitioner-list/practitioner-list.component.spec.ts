import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PractitionerListComponent } from './practitioner-list.component';

describe('PractitionerListComponent', () => {
  let component: PractitionerListComponent;
  let fixture: ComponentFixture<PractitionerListComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [PractitionerListComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PractitionerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
