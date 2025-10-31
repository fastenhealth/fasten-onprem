import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdfOcrComponent } from './pdf-ocr.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HTTP_CLIENT_TOKEN } from 'src/app/dependency-injection';
import { HttpClient } from '@angular/common/http';

describe('PdfOcrComponent', () => {
  let component: PdfOcrComponent;
  let fixture: ComponentFixture<PdfOcrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PdfOcrComponent],
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PdfOcrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
