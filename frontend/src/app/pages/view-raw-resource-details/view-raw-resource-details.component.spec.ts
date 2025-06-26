import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRawResourceDetailsComponent } from './view-raw-resource-details.component';

describe('ViewRawResourceDetailsComponent', () => {
  let component: ViewRawResourceDetailsComponent;
  let fixture: ComponentFixture<ViewRawResourceDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewRawResourceDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewRawResourceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
