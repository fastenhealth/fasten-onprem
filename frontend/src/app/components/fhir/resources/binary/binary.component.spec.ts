import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BinaryComponent } from './binary.component';
import {NgbCollapseModule} from '@ng-bootstrap/ng-bootstrap';

describe('BinaryComponent', () => {
  let component: BinaryComponent;
  let fixture: ComponentFixture<BinaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BinaryComponent ],
      imports: [NgbCollapseModule]

    })
    .compileComponents();

    fixture = TestBed.createComponent(BinaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
