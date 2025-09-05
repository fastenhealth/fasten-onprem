import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdfOcrComponent } from './pdf-ocr.component';

describe('PdfOcrComponent', () => {
  let component: PdfOcrComponent;
  let fixture: ComponentFixture<PdfOcrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PdfOcrComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PdfOcrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
