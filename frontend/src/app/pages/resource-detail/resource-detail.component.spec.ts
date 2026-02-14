import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceDetailComponent } from './resource-detail.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { HTTP_CLIENT_TOKEN } from '../../dependency-injection';
import { HttpClient } from '@angular/common/http';
import { LoadingSpinnerComponent } from 'src/app/components/loading-spinner/loading-spinner.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

describe('ResourceDetailComponent', () => {
  let component: ResourceDetailComponent;
  let fixture: ComponentFixture<ResourceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResourceDetailComponent],
      imports: [HttpClientTestingModule, RouterTestingModule, LoadingSpinnerComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ 'resource_id': 'b64.cmVzb3VyY2VfZmhpcjpiNjQuYzI5MWNtTmxPbUZsZEc1aE9qRXlNelExTmpjNE9UQXhNak0wTlRZM01ETT06UGF0aWVudDoxMjM0NTY3ODkwMTIzNDU2NzAz' }) } }
        },
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ResourceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isEditableResourceType', () => {
    const editableTypes = ['Condition', 'Observation', 'MedicationRequest', 'Encounter', 'AllergyIntolerance', 'Procedure', 'Immunization'];
    const nonEditableTypes = ['Patient', 'CarePlan', 'DiagnosticReport', 'DocumentReference'];

    editableTypes.forEach(type => {
      it(`should return true for ${type}`, () => {
        component.resource = { source_resource_type: type } as any;
        expect(component.isEditableResourceType()).toBeTrue();
      });
    });

    nonEditableTypes.forEach(type => {
      it(`should return false for ${type}`, () => {
        component.resource = { source_resource_type: type } as any;
        expect(component.isEditableResourceType()).toBeFalse();
      });
    });

    it('should return false when resource is null', () => {
      component.resource = null;
      expect(component.isEditableResourceType()).toBeFalse();
    });
  });

  describe('editResource', () => {
    it('should open ResourceEditComponent modal', () => {
      const modalService = TestBed.inject(NgbModal);
      const mockModalRef = {
        componentInstance: {},
        result: new Promise(() => {}),
      };
      spyOn(modalService, 'open').and.returnValue(mockModalRef as any);

      component.resource = {
        source_resource_type: 'Condition',
        source_resource_id: 'cond-123',
        resource_raw: { clinicalStatus: { coding: [{ code: 'active' }] } },
      } as any;
      component.sourceId = 'src-1';

      component.editResource();

      expect(modalService.open).toHaveBeenCalled();
      expect(mockModalRef.componentInstance['resourceType']).toBe('Condition');
      expect(mockModalRef.componentInstance['sourceId']).toBe('src-1');
      expect(mockModalRef.componentInstance['sourceResourceId']).toBe('cond-123');
      // Should be a deep clone, not the same reference
      expect(mockModalRef.componentInstance['resourceRaw']).not.toBe(component.resource.resource_raw);
      expect(mockModalRef.componentInstance['resourceRaw']).toEqual(component.resource.resource_raw);
    });
  });
});
