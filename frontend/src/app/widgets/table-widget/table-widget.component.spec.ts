import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableWidgetComponent } from './table-widget.component';
import {FastenApiService} from '../../services/fasten-api.service';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {HttpClient} from '@angular/common/http';

describe('TableWidgetComponent', () => {
  let component: TableWidgetComponent;
  let fixture: ComponentFixture<TableWidgetComponent>;
  let mockedFastenApiService

  beforeEach(async () => {
    mockedFastenApiService = jasmine.createSpyObj('FastenApiService', ['queryResources'])

    await TestBed.configureTestingModule({
      imports: [ TableWidgetComponent ],
      providers: [
        {
          provide: FastenApiService,
          useValue: mockedFastenApiService
        },
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
