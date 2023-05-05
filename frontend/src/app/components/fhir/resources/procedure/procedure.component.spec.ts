import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcedureComponent } from './procedure.component';
import {NgbCollapseModule} from '@ng-bootstrap/ng-bootstrap';
import {RouterTestingModule} from '@angular/router/testing';

describe('ProcedureComponent', () => {
  let component: ProcedureComponent;
  let fixture: ComponentFixture<ProcedureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcedureComponent, NgbCollapseModule],
      providers: [RouterTestingModule]

    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcedureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
