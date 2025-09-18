import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { FastenApiService } from '../../services/fasten-api.service';
import { HTTP_CLIENT_TOKEN } from '../../dependency-injection';
import { HttpClient } from '@angular/common/http';

import { ViewRawResourceDetailsComponent } from './view-raw-resource-details.component';

describe('ViewRawResourceDetailsComponent', () => {
  let component: ViewRawResourceDetailsComponent;
  let fixture: ComponentFixture<ViewRawResourceDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewRawResourceDetailsComponent ],
      imports: [ HttpClientTestingModule, RouterTestingModule ],
      providers: [
        FastenApiService,
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap( { 'id': '123' } ) } }
        },
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewRawResourceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
