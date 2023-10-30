import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackgroundJobsComponent } from './background-jobs.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {HttpClient} from '@angular/common/http';

describe('BackgroundJobsComponent', () => {
  let component: BackgroundJobsComponent;
  let fixture: ComponentFixture<BackgroundJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BackgroundJobsComponent ],
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackgroundJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
