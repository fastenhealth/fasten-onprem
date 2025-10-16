import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraOcrComponent } from './camera-ocr.component';
import { HTTP_CLIENT_TOKEN } from 'src/app/dependency-injection';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CameraOcrComponent', () => {
  let component: CameraOcrComponent;
  let fixture: ComponentFixture<CameraOcrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CameraOcrComponent],
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CameraOcrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
