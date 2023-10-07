import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackgroundJobsComponent } from './background-jobs.component';

describe('BackgroundJobsComponent', () => {
  let component: BackgroundJobsComponent;
  let fixture: ComponentFixture<BackgroundJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BackgroundJobsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackgroundJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
