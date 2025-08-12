import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PractitionerViewComponent } from './practitioner-view.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HTTP_CLIENT_TOKEN } from 'src/app/dependency-injection';
import { HttpClient, HttpClientModule } from '@angular/common/http';

describe('PractitionerViewComponent', () => {
  let component: PractitionerViewComponent;
  let fixture: ComponentFixture<PractitionerViewComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [PractitionerViewComponent, HttpClientModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: (key: string) => 'test-practitioner-id' },
            },
            params: of({ id: 'test-practitioner-id' }),
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
    fixture = TestBed.createComponent(PractitionerViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
