import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListEncounterComponent } from './list-encounter.component';

describe('ListEncounterComponent', () => {
  let component: ListEncounterComponent;
  let fixture: ComponentFixture<ListEncounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListEncounterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListEncounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
