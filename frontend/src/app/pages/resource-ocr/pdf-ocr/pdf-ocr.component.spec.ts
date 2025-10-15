import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdfOcrComponent } from './pdf-ocr.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PdfOcrComponent', () => {
  let component: PdfOcrComponent;
  let fixture: ComponentFixture<PdfOcrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PdfOcrComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PdfOcrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
