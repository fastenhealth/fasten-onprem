import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FallbackComponent } from './fallback.component';
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';

describe('FallbackComponent', () => {
  let component: FallbackComponent;
  let fixture: ComponentFixture<FallbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ FallbackComponent ],
      providers: [
        {
          provide: HIGHLIGHT_OPTIONS,
          useValue: {
            coreLibraryLoader: () => import('highlight.js/lib/core'),
            lineNumbersLoader: () => import('highlightjs-line-numbers.js'), // Optional, only if you want the line numbers
            languages: {
              json: () => import('highlight.js/lib/languages/json')
            },
          }
        },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
