import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ResourceSearchDatatableComponent } from './resource-search-datatable.component';
import { FastenApiService } from 'src/app/services/fasten-api.service';
import { HTTP_CLIENT_TOKEN } from 'src/app/dependency-injection';
import { HttpClient } from '@angular/common/http';
import { ResourceSearchDatatableOutletDirective } from './resource-search-datable-outlet.directive';

describe('ResourceSearchDatatableComponent', () => {
  let component: ResourceSearchDatatableComponent;
  let fixture: ComponentFixture<ResourceSearchDatatableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResourceSearchDatatableComponent, ResourceSearchDatatableOutletDirective],
      imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule],
      providers: [
        FastenApiService,
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceSearchDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
