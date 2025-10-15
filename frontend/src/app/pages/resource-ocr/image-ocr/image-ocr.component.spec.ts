import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageOcrComponent } from './image-ocr.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ImageOcrComponent', () => {
  let component: ImageOcrComponent;
  let fixture: ComponentFixture<ImageOcrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageOcrComponent, HttpClientTestingModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageOcrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
