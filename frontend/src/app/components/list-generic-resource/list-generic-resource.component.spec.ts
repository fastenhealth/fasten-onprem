import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListGenericResourceComponent } from './list-generic-resource.component';

describe('ListGenericResourceComponent', () => {
  let component: ListGenericResourceComponent;
  let fixture: ComponentFixture<ListGenericResourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListGenericResourceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListGenericResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
