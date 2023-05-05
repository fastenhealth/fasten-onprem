import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalSourcesComponent } from './medical-sources.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {HttpClient} from '@angular/common/http';

describe('MedicalSourcesComponent', () => {
  let component: MedicalSourcesComponent;
  let fixture: ComponentFixture<MedicalSourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalSourcesComponent ],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalSourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
