import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceDetailComponent } from './resource-detail.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {ActivatedRoute, convertToParamMap} from '@angular/router';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {HttpClient} from '@angular/common/http';
import { LoadingSpinnerComponent } from 'src/app/components/loading-spinner/loading-spinner.component';
import { of } from 'rxjs';

describe('ResourceDetailComponent', () => {
  let component: ResourceDetailComponent;
  let fixture: ComponentFixture<ResourceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResourceDetailComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        LoadingSpinnerComponent,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({
                resource_id:
                  'b64.cmVzb3VyY2VfZmhpcjpiNjQuYzI5MWNtTmxPbUZsZEc1aE9qRXlNelExTmpjNE9UQXhNak0wTlRZM01ETT06UGF0aWVudDoxMjM0NTY3ODkwMTIzNDU2NzAz',
              }),
              queryParams: of({
                isDelegatedResource: 'true',
                ownerUserId: 'user-1234',
              }),
            },
          },
        },
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
