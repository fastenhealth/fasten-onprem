import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlossaryLookupComponent } from './glossary-lookup.component';

describe('GlossaryLookupComponent', () => {
  let component: GlossaryLookupComponent;
  let fixture: ComponentFixture<GlossaryLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlossaryLookupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlossaryLookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
