import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodableConceptComponent } from './codable-concept.component';

describe('CodableConceptComponent', () => {
  let component: CodableConceptComponent;
  let fixture: ComponentFixture<CodableConceptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodableConceptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodableConceptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
