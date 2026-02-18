import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatableGenericResourceComponent } from './datatable-generic-resource.component';
import {HTTP_CLIENT_TOKEN} from '../../../dependency-injection';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { RouterTestingModule } from '@angular/router/testing';

describe('ListGenericResourceComponent', () => {
  let component: DatatableGenericResourceComponent;
  let fixture: ComponentFixture<DatatableGenericResourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatatableGenericResourceComponent ],
      imports: [HttpClientTestingModule, NgxDatatableModule, RouterTestingModule],
      providers: [
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatatableGenericResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
