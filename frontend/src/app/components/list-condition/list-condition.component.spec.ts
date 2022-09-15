import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListConditionComponent } from './list-condition.component';

describe('ListConditionComponent', () => {
  let component: ListConditionComponent;
  let fixture: ComponentFixture<ListConditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListConditionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
