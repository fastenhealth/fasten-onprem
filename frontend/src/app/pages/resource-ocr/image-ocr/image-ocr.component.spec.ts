import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageOcrComponent } from './image-ocr.component';
import { HTTP_CLIENT_TOKEN } from 'src/app/dependency-injection';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ImageOcrComponent', () => {
  let component: ImageOcrComponent;
  let fixture: ComponentFixture<ImageOcrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImageOcrComponent],
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageOcrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
