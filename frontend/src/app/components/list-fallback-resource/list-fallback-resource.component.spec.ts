import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFallbackResourceComponent } from './list-fallback-resource.component';

describe('ListFallbackResourceComponent', () => {
  let component: ListFallbackResourceComponent;
  let fixture: ComponentFixture<ListFallbackResourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListFallbackResourceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListFallbackResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
