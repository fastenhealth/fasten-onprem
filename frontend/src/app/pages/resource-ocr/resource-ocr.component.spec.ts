import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceOcrComponent } from './resource-ocr.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HTTP_CLIENT_TOKEN } from 'src/app/dependency-injection';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';

describe('ResourceOcrComponent', () => {
  let component: ResourceOcrComponent;
  let fixture: ComponentFixture<ResourceOcrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResourceOcrComponent],
      imports: [HttpClientTestingModule],
      providers: [{ provide: HTTP_CLIENT_TOKEN, useClass: HttpClient }, FormBuilder],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceOcrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
