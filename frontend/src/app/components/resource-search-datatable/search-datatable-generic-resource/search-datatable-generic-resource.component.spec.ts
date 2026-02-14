import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchDatatableGenericResourceComponent } from './search-datatable-generic-resource.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { HttpClient } from '@angular/common/http';
import { HTTP_CLIENT_TOKEN } from 'src/app/dependency-injection';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SearchDatatableGenericResourceComponent', () => {
  let component: SearchDatatableGenericResourceComponent;
  let fixture: ComponentFixture<SearchDatatableGenericResourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchDatatableGenericResourceComponent],
      imports: [NgxDatatableModule, HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchDatatableGenericResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
