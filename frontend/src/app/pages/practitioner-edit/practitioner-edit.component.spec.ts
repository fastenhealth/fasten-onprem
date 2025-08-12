import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PractitionerEditPageComponent } from './practitioner-edit.component';
import { ActivatedRoute } from '@angular/router';
import { HTTP_CLIENT_TOKEN } from 'src/app/dependency-injection';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';

describe('PractitionerEditComponent', () => {
  let component: PractitionerEditPageComponent;
  let fixture: ComponentFixture<PractitionerEditPageComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [PractitionerEditPageComponent, HttpClientModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: (key: string) => 'test-practitioner-id' },
            },
            params: of({ id: 'test-practitioner-id' })
          },
        },
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PractitionerEditPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
