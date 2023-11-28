import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentReferenceComponent } from './document-reference.component';
import {NgbCollapseModule} from '@ng-bootstrap/ng-bootstrap';

describe('DocumentReferenceComponent', () => {
  let component: DocumentReferenceComponent;
  let fixture: ComponentFixture<DocumentReferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgbCollapseModule],
      declarations: [ DocumentReferenceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentReferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
