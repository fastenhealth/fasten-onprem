import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResourceEditComponent } from './resource-edit.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HTTP_CLIENT_TOKEN } from '../../dependency-injection';
import { HttpClient } from '@angular/common/http';
import { FastenApiService } from '../../services/fasten-api.service';
import { ToastService } from '../../services/toast.service';
import { of, throwError } from 'rxjs';

describe('ResourceEditComponent', () => {
  let component: ResourceEditComponent;
  let fixture: ComponentFixture<ResourceEditComponent>;
  let mockActiveModal: jasmine.SpyObj<NgbActiveModal>;
  let mockFastenApi: jasmine.SpyObj<FastenApiService>;
  let mockToastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    mockActiveModal = jasmine.createSpyObj('NgbActiveModal', [
      'close',
      'dismiss',
    ]);
    mockFastenApi = jasmine.createSpyObj('FastenApiService', [
      'updateResourceBySourceId',
    ]);
    mockToastService = jasmine.createSpyObj('ToastService', ['show']);

    await TestBed.configureTestingModule({
      imports: [ResourceEditComponent, HttpClientTestingModule],
      providers: [
        { provide: NgbActiveModal, useValue: mockActiveModal },
        { provide: FastenApiService, useValue: mockFastenApi },
        { provide: ToastService, useValue: mockToastService },
        { provide: HTTP_CLIENT_TOKEN, useClass: HttpClient },
      ],
    }).compileComponents();
  });

  function createComponent(resourceType: string, resourceRaw: any) {
    fixture = TestBed.createComponent(ResourceEditComponent);
    component = fixture.componentInstance;
    component.resourceType = resourceType;
    component.resourceRaw = JSON.parse(JSON.stringify(resourceRaw));
    component.sourceId = 'source-123';
    component.sourceResourceId = 'resource-456';
    fixture.detectChanges();
  }

  // ── Creation / form building ──

  it('should create', () => {
    createComponent('Condition', {
      clinicalStatus: { coding: [{ code: 'active' }] },
    });
    expect(component).toBeTruthy();
  });

  it('should build Condition form with correct initial values', () => {
    createComponent('Condition', {
      clinicalStatus: { coding: [{ code: 'active' }] },
      onsetDateTime: '2023-06-15',
      note: [{ text: 'Test note' }],
    });
    expect(component.form.get('clinicalStatus').value).toBe('active');
    expect(component.form.get('onsetDateTime').value).toEqual({
      year: 2023,
      month: 6,
      day: 15,
    });
    expect(component.form.get('note').value).toBe('Test note');
  });

  it('should build Observation form with valueQuantity fields', () => {
    createComponent('Observation', {
      status: 'final',
      effectiveDateTime: '2024-01-10',
      valueQuantity: { value: 7.2, unit: '%' },
    });
    expect(component.form.get('status').value).toBe('final');
    expect(component.form.get('valueQuantityValue').value).toBe(7.2);
    expect(component.form.get('valueQuantityUnit').value).toBe('%');
  });

  it('should build Observation form with valueString field', () => {
    createComponent('Observation', {
      status: 'final',
      valueString: 'Positive',
    });
    expect(component.form.get('valueString').value).toBe('Positive');
  });

  it('should build MedicationRequest form with correct initial values', () => {
    createComponent('MedicationRequest', {
      status: 'active',
      intent: 'order',
      authoredOn: '2022-03-10',
      dosageInstruction: [{ text: 'Take 1 tablet daily' }],
    });
    expect(component.form.get('status').value).toBe('active');
    expect(component.form.get('intent').value).toBe('order');
    expect(component.form.get('dosage').value).toBe('Take 1 tablet daily');
  });

  it('should build Encounter form with period dates', () => {
    createComponent('Encounter', {
      status: 'finished',
      period: { start: '2024-06-15T09:00:00Z', end: '2024-06-15T09:45:00Z' },
    });
    expect(component.form.get('status').value).toBe('finished');
    expect(component.form.get('periodStart').value.year).toBe(2024);
    expect(component.form.get('periodEnd').value).toBeTruthy();
  });

  it('should build AllergyIntolerance form with correct initial values', () => {
    createComponent('AllergyIntolerance', {
      clinicalStatus: { coding: [{ code: 'active' }] },
      category: ['medication'],
      recordedDate: '2020-08-01',
    });
    expect(component.form.get('clinicalStatus').value).toBe('active');
    expect(component.form.get('category').value).toBe('medication');
  });

  it('should build Procedure form with correct initial values', () => {
    createComponent('Procedure', {
      status: 'completed',
      performedDateTime: '2025-09-03',
    });
    expect(component.form.get('status').value).toBe('completed');
    expect(component.form.get('performedDateTime').value).toEqual({
      year: 2025,
      month: 9,
      day: 3,
    });
  });

  it('should build Immunization form with correct initial values', () => {
    createComponent('Immunization', {
      status: 'completed',
      occurrenceDateTime: '2024-10-15',
    });
    expect(component.form.get('status').value).toBe('completed');
    expect(component.form.get('occurrenceDateTime').value).toEqual({
      year: 2024,
      month: 10,
      day: 15,
    });
  });

  it('should build empty form for unknown resource type', () => {
    createComponent('Patient', {});
    expect(Object.keys(component.form.controls).length).toBe(0);
  });

  // ── Display name extraction ──

  it('should extract display name from code.coding', () => {
    createComponent('Condition', {
      code: { coding: [{ display: 'Hypertension' }] },
      clinicalStatus: { coding: [{ code: 'active' }] },
    });
    expect(component.getResourceDisplayName()).toBe('Hypertension');
  });

  it('should extract display name from code.text', () => {
    createComponent('Condition', {
      code: { text: 'Type 2 Diabetes' },
      clinicalStatus: { coding: [{ code: 'active' }] },
    });
    expect(component.getResourceDisplayName()).toBe('Type 2 Diabetes');
  });

  it('should extract display name from medicationCodeableConcept', () => {
    createComponent('MedicationRequest', {
      medicationCodeableConcept: { coding: [{ display: 'Lisinopril 10mg' }] },
      status: 'active',
      intent: 'order',
    });
    expect(component.getResourceDisplayName()).toBe('Lisinopril 10mg');
  });

  it('should extract display name from vaccineCode', () => {
    createComponent('Immunization', {
      vaccineCode: { coding: [{ display: 'Influenza vaccine' }] },
      status: 'completed',
    });
    expect(component.getResourceDisplayName()).toBe('Influenza vaccine');
  });

  it('should fall back to resourceType when no display name found', () => {
    createComponent('Procedure', { status: 'completed' });
    expect(component.getResourceDisplayName()).toBe('Procedure');
  });

  // ── Date helpers ──

  it('should parse ISO date string to NgbDateStruct', () => {
    createComponent('Condition', {
      clinicalStatus: { coding: [{ code: 'active' }] },
    });
    expect(component.parseDate('2023-06-15')).toEqual({
      year: 2023,
      month: 6,
      day: 15,
    });
  });

  it('should return null for null/undefined date', () => {
    createComponent('Condition', {
      clinicalStatus: { coding: [{ code: 'active' }] },
    });
    expect(component.parseDate(null)).toBeNull();
    expect(component.parseDate(undefined)).toBeNull();
  });

  it('should return null for invalid date string', () => {
    createComponent('Condition', {
      clinicalStatus: { coding: [{ code: 'active' }] },
    });
    expect(component.parseDate('not-a-date')).toBeNull();
  });

  it('should convert NgbDateStruct to ISO date string', () => {
    createComponent('Condition', {
      clinicalStatus: { coding: [{ code: 'active' }] },
    });
    const result = component.toIsoDate({ year: 2023, month: 6, day: 15 });
    expect(result).toContain('2023');
    expect(new Date(result).getFullYear()).toBe(2023);
  });

  it('should return null when converting null date struct', () => {
    createComponent('Condition', {
      clinicalStatus: { coding: [{ code: 'active' }] },
    });
    expect(component.toIsoDate(null)).toBeNull();
  });

  // ── Value type helpers ──

  it('should detect valueQuantity presence', () => {
    createComponent('Observation', {
      status: 'final',
      valueQuantity: { value: 120 },
    });
    expect(component.hasValueQuantity()).toBeTrue();
  });

  it('should detect valueQuantity absence', () => {
    createComponent('Observation', { status: 'final' });
    expect(component.hasValueQuantity()).toBeFalse();
  });

  it('should detect valueString presence', () => {
    createComponent('Observation', {
      status: 'final',
      valueString: 'Positive',
    });
    expect(component.hasValueString()).toBeTrue();
  });

  it('should detect valueString absence', () => {
    createComponent('Observation', { status: 'final' });
    expect(component.hasValueString()).toBeFalse();
  });

  // ── Merge and submit ──

  it('should merge Condition form values into resource_raw', () => {
    createComponent('Condition', {
      clinicalStatus: { coding: [{ code: 'active' }] },
      onsetDateTime: '2023-01-01',
    });
    component.form.get('clinicalStatus').setValue('resolved');
    component.form.get('note').setValue('Now resolved');

    mockFastenApi.updateResourceBySourceId.and.returnValue(of(true));
    component.onSubmit();

    expect(component.resourceRaw.clinicalStatus.coding[0].code).toBe(
      'resolved',
    );
    expect(component.resourceRaw.note[0].text).toBe('Now resolved');
  });

  it('should merge Observation valueQuantity into resource_raw', () => {
    createComponent('Observation', {
      status: 'final',
      valueQuantity: { value: 7.2, unit: '%' },
    });
    component.form.get('valueQuantityValue').setValue(6.5);
    component.form.get('valueQuantityUnit').setValue('mmol/L');

    mockFastenApi.updateResourceBySourceId.and.returnValue(of(true));
    component.onSubmit();

    expect(component.resourceRaw.valueQuantity.value).toBe(6.5);
    expect(component.resourceRaw.valueQuantity.unit).toBe('mmol/L');
  });

  it('should merge MedicationRequest dosage into resource_raw', () => {
    createComponent('MedicationRequest', {
      status: 'active',
      intent: 'order',
      dosageInstruction: [{ text: 'Take 1 daily' }],
    });
    component.form.get('status').setValue('completed');
    component.form.get('dosage').setValue('Take 2 daily');

    mockFastenApi.updateResourceBySourceId.and.returnValue(of(true));
    component.onSubmit();

    expect(component.resourceRaw.status).toBe('completed');
    expect(component.resourceRaw.dosageInstruction[0].text).toBe(
      'Take 2 daily',
    );
  });

  it('should merge Encounter period into resource_raw', () => {
    createComponent('Encounter', {
      status: 'planned',
      period: { start: '2024-06-15T09:00:00Z' },
    });
    component.form.get('status').setValue('finished');

    mockFastenApi.updateResourceBySourceId.and.returnValue(of(true));
    component.onSubmit();

    expect(component.resourceRaw.status).toBe('finished');
  });

  it('should merge AllergyIntolerance category into resource_raw', () => {
    createComponent('AllergyIntolerance', {
      clinicalStatus: { coding: [{ code: 'active' }] },
      category: ['medication'],
    });
    component.form.get('category').setValue('food');

    mockFastenApi.updateResourceBySourceId.and.returnValue(of(true));
    component.onSubmit();

    expect(component.resourceRaw.category).toEqual(['food']);
  });

  it('should merge Procedure status into resource_raw', () => {
    createComponent('Procedure', { status: 'in-progress' });
    component.form.get('status').setValue('completed');

    mockFastenApi.updateResourceBySourceId.and.returnValue(of(true));
    component.onSubmit();

    expect(component.resourceRaw.status).toBe('completed');
  });

  it('should merge Immunization status into resource_raw', () => {
    createComponent('Immunization', { status: 'completed' });
    component.form.get('status').setValue('entered-in-error');

    mockFastenApi.updateResourceBySourceId.and.returnValue(of(true));
    component.onSubmit();

    expect(component.resourceRaw.status).toBe('entered-in-error');
  });

  // ── Submit behavior ──

  it('should call updateResourceBySourceId on submit and close modal on success', () => {
    createComponent('Condition', {
      clinicalStatus: { coding: [{ code: 'active' }] },
    });
    mockFastenApi.updateResourceBySourceId.and.returnValue(of(true));

    component.onSubmit();

    expect(mockFastenApi.updateResourceBySourceId).toHaveBeenCalledWith(
      'source-123',
      'resource-456',
      component.resourceRaw,
    );
    expect(mockActiveModal.close).toHaveBeenCalledWith(component.resourceRaw);
    expect(mockToastService.show).toHaveBeenCalled();
    expect(component.saving).toBeFalse();
  });

  it('should show error toast on submit failure', () => {
    createComponent('Condition', {
      clinicalStatus: { coding: [{ code: 'active' }] },
    });
    mockFastenApi.updateResourceBySourceId.and.returnValue(
      throwError(() => ({ error: { message: 'fail' } })),
    );

    component.onSubmit();

    expect(mockActiveModal.close).not.toHaveBeenCalled();
    expect(mockToastService.show).toHaveBeenCalled();
    expect(component.saving).toBeFalse();
  });

  it('should not submit when already saving', () => {
    createComponent('Condition', {
      clinicalStatus: { coding: [{ code: 'active' }] },
    });
    component.saving = true;

    component.onSubmit();

    expect(mockFastenApi.updateResourceBySourceId).not.toHaveBeenCalled();
  });

  // ── Note merging edge cases ──

  it('should add note to resource that had no notes', () => {
    createComponent('Condition', {
      clinicalStatus: { coding: [{ code: 'active' }] },
    });
    component.form.get('note').setValue('Brand new note');

    mockFastenApi.updateResourceBySourceId.and.returnValue(of(true));
    component.onSubmit();

    expect(component.resourceRaw.note).toEqual([{ text: 'Brand new note' }]);
  });

  it('should update existing note text', () => {
    createComponent('Condition', {
      clinicalStatus: { coding: [{ code: 'active' }] },
      note: [{ text: 'Old note' }],
    });
    component.form.get('note').setValue('Updated note');

    mockFastenApi.updateResourceBySourceId.and.returnValue(of(true));
    component.onSubmit();

    expect(component.resourceRaw.note[0].text).toBe('Updated note');
  });

  it('should clear note text when set to empty string', () => {
    createComponent('Condition', {
      clinicalStatus: { coding: [{ code: 'active' }] },
      note: [{ text: 'Will be cleared' }],
    });
    component.form.get('note').setValue('');

    mockFastenApi.updateResourceBySourceId.and.returnValue(of(true));
    component.onSubmit();

    expect(component.resourceRaw.note[0].text).toBe('');
  });
});
