import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentReferenceComponent } from './document-reference.component';
import {NgbCollapseModule} from '@ng-bootstrap/ng-bootstrap';
import {RouterTestingModule} from '@angular/router/testing';

describe('DocumentReferenceComponent', () => {
  let component: DocumentReferenceComponent;
  let fixture: ComponentFixture<DocumentReferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgbCollapseModule, DocumentReferenceComponent, RouterTestingModule],
      declarations: [  ]
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
