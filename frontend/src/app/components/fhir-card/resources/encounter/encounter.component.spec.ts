import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncounterComponent } from './encounter.component';
import {RouterTestingModule} from '@angular/router/testing';

describe('EncounterComponent', () => {
  let component: EncounterComponent;
  let fixture: ComponentFixture<EncounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EncounterComponent, RouterTestingModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EncounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
