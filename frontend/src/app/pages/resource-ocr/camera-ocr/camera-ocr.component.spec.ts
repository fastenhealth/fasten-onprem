import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraOcrComponent } from './camera-ocr.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CameraOcrComponent', () => {
  let component: CameraOcrComponent;
  let fixture: ComponentFixture<CameraOcrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CameraOcrComponent, HttpClientTestingModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraOcrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
