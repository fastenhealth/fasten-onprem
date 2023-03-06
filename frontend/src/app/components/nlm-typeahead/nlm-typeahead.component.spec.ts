import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NlmTypeaheadComponent } from './nlm-typeahead.component';

describe('NlmTypeaheadComponent', () => {
  let component: NlmTypeaheadComponent;
  let fixture: ComponentFixture<NlmTypeaheadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NlmTypeaheadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NlmTypeaheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
