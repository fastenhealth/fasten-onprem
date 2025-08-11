import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceSearchTableComponent } from './resource-search-table.component';
import { ResourceSearchDatatableModule } from 'src/app/components/resource-search-datatable/resource-search-datatable.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HTTP_CLIENT_TOKEN } from 'src/app/dependency-injection';
import { HttpClient } from '@angular/common/http';

describe('ResourceSearchTableComponent', () => {
  let component: ResourceSearchTableComponent;
  let fixture: ComponentFixture<ResourceSearchTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResourceSearchTableComponent],
      imports: [
        ResourceSearchDatatableModule,
        HttpClientTestingModule,
      ],
      providers: [
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceSearchTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
