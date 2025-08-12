import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PractitionerCreateComponent } from './practitioner-create.component';

describe('PractitionerCreateComponent', () => {
  let component: PractitionerCreateComponent;
  let fixture: ComponentFixture<PractitionerCreateComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [PractitionerCreateComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PractitionerCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
