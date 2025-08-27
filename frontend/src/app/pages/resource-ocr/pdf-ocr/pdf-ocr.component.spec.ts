import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdfOcrComponent } from './pdf-ocr.component';
import { ImageMagnifierComponent } from 'src/app/components/image-magnifier/image-magnifier.component';

describe('PdfOcrComponent', () => {
  let component: PdfOcrComponent;
  let fixture: ComponentFixture<PdfOcrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PdfOcrComponent, ImageMagnifierComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PdfOcrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
