import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableComponent } from './table.component';
import { TableRowItemDataType } from './table-row-item';
import { RouterTestingModule } from '@angular/router/testing';
import { FastenDisplayModel } from 'src/lib/models/fasten/fasten-display-model';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TableComponent, RouterTestingModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    component.displayModel = {
      source_id: '123-456-789=',
    } as FastenDisplayModel,
    component.tableData = [
      {
        enabled: true,
        label: 'hello',
        data_type: TableRowItemDataType.Reference,
        data: {
          reference: 'aHR0cHM6Ly93d3cubWVyY3kubmV0L3NpdGVzL2RlZmF1bHQvZmlsZXMvZG9jdG9yX2ltYWdlcy9kZXNrdG9wLzE2NTk4ODYwNTktbS5qcGc=',
          display: 'binary'
        }
      }
    ]
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('encodes urls properly', () => {
    spyOn(console, 'log').and.callThrough();
    const link = fixture.debugElement.nativeElement.querySelector('a');

    expect(link.href).toContain(
      '/explore/123-456-789%3D/resource/aHR0cHM6Ly93d3cubWVyY3kubmV0L3NpdGVzL2RlZmF1bHQvZmlsZXMvZG9jdG9yX2ltYWdlcy9kZXNrdG9wLzE2NTk4ODYwNTktbS5qcGc%3D'
    );
  });
});
