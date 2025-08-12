import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PractitionerViewComponent } from './practitioner-view.component';

describe('PractitionerViewComponent', () => {
  let component: PractitionerViewComponent;
  let fixture: ComponentFixture<PractitionerViewComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [PractitionerViewComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PractitionerViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
