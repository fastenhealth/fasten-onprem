import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilitiesSidebarComponent } from './utilities-sidebar.component';

describe('UtilitiesSidebarComponent', () => {
  let component: UtilitiesSidebarComponent;
  let fixture: ComponentFixture<UtilitiesSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilitiesSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilitiesSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
