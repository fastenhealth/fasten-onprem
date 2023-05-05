import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableWidgetComponent } from './table-widget.component';

describe('TableWidgetComponent', () => {
  let component: TableWidgetComponent;
  let fixture: ComponentFixture<TableWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TableWidgetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
