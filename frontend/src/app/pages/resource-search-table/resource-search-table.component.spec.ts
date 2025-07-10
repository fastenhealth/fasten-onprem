import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceSearchTableComponent } from './resource-search-table.component';

describe('ResourceSearchTableComponent', () => {
  let component: ResourceSearchTableComponent;
  let fixture: ComponentFixture<ResourceSearchTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResourceSearchTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceSearchTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
