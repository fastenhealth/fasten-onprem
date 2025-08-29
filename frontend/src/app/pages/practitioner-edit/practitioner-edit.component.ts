import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { HighlightModule } from 'ngx-highlightjs';

import { FastenApiService } from '../../services/fasten-api.service';
import { Practitioner } from 'src/app/models/fasten/practitioner';
import { NlmTypeaheadComponent } from '../../components/nlm-typeahead/nlm-typeahead.component';
import { AddressModel } from '../../../lib/models/datatypes/address-model';
import { PractitionerModel } from '../../../lib/models/resources/practitioner-model';
import { parseFullName } from 'parse-full-name';

@Component({
  selector: 'app-practitioner-edit-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbTooltipModule,
    HighlightModule,
    NlmTypeaheadComponent
  ],
  templateUrl: './practitioner-edit.component.html',
  styleUrls: ['./practitioner-edit.component.scss']
})
export class PractitionerEditPageComponent implements OnInit {
  practitioner: Practitioner | null = null;
  practitionerId: string = '';
  
  debugMode: boolean = false;
  isSubmitting: boolean = false;
  isLoading: boolean = true;
  loadError: string = '';

  newPractitionerTypeaheadForm: FormGroup;
  newPractitionerForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fastenApi: FastenApiService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.practitionerId = params['id'];
      
      if (this.practitionerId) {
        this.loadPractitioner();
      } else {
        this.loadError = 'No practitioner ID provided';
        this.isLoading = false;
      }
    });

    this.setupFormSubscriptions();
  }

  private initializeForms(): void {
    this.newPractitionerTypeaheadForm = new FormGroup({
      data: new FormControl(null)
    });

    this.newPractitionerForm = new FormGroup({
      id: new FormControl(null),
      identifier: new FormControl([]),
      name: new FormControl(null, Validators.required),
      profession: new FormControl(null, Validators.required),
      phone: new FormControl(null, Validators.pattern('[- +()0-9]+')),
      fax: new FormControl(null, Validators.pattern('[- +()0-9]+')),
      email: new FormControl(null, Validators.email),
      address: new FormGroup({
        line1: new FormControl(null),
        line2: new FormControl(null),
        city: new FormControl(null),
        state: new FormControl(null),
        zip: new FormControl(null),
        country: new FormControl(null),
      })
    });
  }

  private setupFormSubscriptions(): void {
    this.newPractitionerTypeaheadForm.valueChanges.subscribe(form => {
      let val = form.data;
      if (val == null) {
        // Don't reset when editing - user might be clearing to type new value
        return;
      }

      // Auto-populate fields from typeahead selection
      if (val.id) {
        this.newPractitionerForm.get('id')?.setValue(val.id);
      }
      if (val.provider_type) {
        this.newPractitionerForm.get('profession')?.setValue(val.provider_type);
      }
      if (val.identifier) {
        this.newPractitionerForm.get('identifier')?.setValue(val.identifier);
      }
      if (val.provider_phone) {
        this.newPractitionerForm.get('phone')?.setValue(val.provider_phone);
      }
      if (val.provider_fax) {
        this.newPractitionerForm.get('fax')?.setValue(val.provider_fax);
      }

      if (val.provider_address) {
        let addressGroup = this.newPractitionerForm.get('address');
        addressGroup?.get('line1')?.setValue(val.provider_address.line1);
        addressGroup?.get('line2')?.setValue(val.provider_address.line2);
        addressGroup?.get('city')?.setValue(val.provider_address.city);
        addressGroup?.get('state')?.setValue(val.provider_address.state);
        addressGroup?.get('zip')?.setValue(val.provider_address.zip);
        addressGroup?.get('country')?.setValue(val.provider_address.country);
      }
      if (val.text) {
        this.newPractitionerForm.get('name')?.setValue(val.text);
      }
    });
  }

  loadPractitioner(): void {
    this.isLoading = true;
    this.loadError = '';

    this.fastenApi.getAllPractitioners().subscribe({
      next: (practitioners: Practitioner[]) => {
        this.practitioner = practitioners.find(p => 
          p.source_resource_id === this.practitionerId
        ) || null;

        if (!this.practitioner) {
          this.loadError = 'Practitioner not found';
        } else {
          this.populateForm();
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading practitioner:', error);
        this.loadError = 'Failed to load practitioner details';
        this.isLoading = false;
      }
    });
  }

  private populateForm(): void {
    if (!this.practitioner) return;

    // Set the name in the typeahead form
    this.newPractitionerTypeaheadForm.patchValue({
      data: {
        text: this.practitioner.full_name,
        id: this.practitioner.source_resource_id
      }
    });

    // Populate main form
    const formData: any = {
      id: this.practitioner.source_resource_id,
      name: this.practitioner.full_name,
      identifier: [],
    };
  
    // Handle contact information
    formData.email = this.practitioner.email || '';
    formData.phone = this.practitioner.phone || '';  
    formData.fax = this.practitioner.fax || '';
  
    // Handle profession from jobTitle or qualification
    if (this.practitioner.jobTitle) {
      formData.profession = {
        text: this.practitioner.jobTitle
      };
    } else if (this.practitioner.resource_raw?.qualification && Array.isArray(this.practitioner.resource_raw.qualification)) {
      const firstQualification = this.practitioner.resource_raw.qualification[0];
      if (firstQualification?.code?.text) {
        formData.profession = {
          text: firstQualification.code.text
        };
      } else if (firstQualification?.code?.coding?.[0]?.display) {
        formData.profession = {
          text: firstQualification.code.coding[0].display
        };
      }
    }

    // Handle address data
    if (this.practitioner.address) {
      formData.address = {
        line1: this.practitioner.address.line?.[0] || '',
        line2: this.practitioner.address.line?.[1] || '',
        city: this.practitioner.address.city || '',
        state: this.practitioner.address.state || '',
        zip: this.practitioner.address.postalCode || '',
        country: this.practitioner.address.country ? {
          text: this.practitioner.address.country
        } : null
      };
    } else {
      formData.address = {
        line1: '', line2: '', city: '', state: '', zip: '', country: null
      };
    }
  
    console.log('Form data being set:', formData);
    this.newPractitionerForm.patchValue(formData);
  }

  get submitEnabled(): boolean {
    return this.newPractitionerForm.valid && !this.isSubmitting;
  }

  submit(): void {
    if (!this.practitioner || !this.newPractitionerForm.valid) return;

    this.newPractitionerForm.markAllAsTouched();
    if (!this.newPractitionerForm.valid) return;

    this.isSubmitting = true;

    // Convert form data to FHIR Practitioner format
    const updatedPractitioner = this.formToFhirPractitioner();

    // Use the updatePractitioner method you created earlier
    this.fastenApi.updatePractitioner(this.practitionerId, updatedPractitioner).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response && response.success) {
          // Navigate back to view page or list
          this.router.navigate(['/practitioners/view', this.practitionerId]);
        } else {
          alert('Failed to update practitioner: ' + (response?.error || 'Unknown error'));
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error updating practitioner:', error);
        const errorMessage = error?.error?.error || error?.message || 'Unknown error';
        alert('Failed to update practitioner: ' + errorMessage);
      }
    });
  }

  private formToFhirPractitioner(): any {
    const formValue = this.newPractitionerForm.value;
    
    // Build telecom array
    const telecom = [];
    if (formValue.phone) {
      telecom.push({
        system: 'phone',
        value: formValue.phone,
        use: 'work'
      });
    }
    if (formValue.fax) {
      telecom.push({
        system: 'fax',
        value: formValue.fax,
        use: 'work'
      });
    }
    if (formValue.email) {
      telecom.push({
        system: 'email',
        value: formValue.email,
        use: 'work'
      });
    }
  
    const qualification = [];
    if (formValue.profession?.text) {
      qualification.push({
        code: {
          text: formValue.profession.text
        }
      });
    }
  
    // Build address array
    const address = [];
    if (formValue.address.line1 || formValue.address.city || formValue.address.state) {
      const addressLines = [];
      if (formValue.address.line1) addressLines.push(formValue.address.line1);
      if (formValue.address.line2) addressLines.push(formValue.address.line2);

      address.push({
        line: addressLines,
        city: formValue.address.city,
        state: formValue.address.state,
        postalCode: formValue.address.zip,
        country: formValue.address.country?.text || formValue.address.country
      });
    }
  
    const fhirPractitioner = {
      resourceType: 'Practitioner',
      id: this.practitionerId,
      name: [{
        text: formValue.name,
        use: 'official'
      }],
      telecom: telecom,
      address: address,
      qualification: qualification,
      identifier: formValue.identifier || [],
      active: true
    };
  
    console.log('Generated FHIR practitioner:', fhirPractitioner);
    return fhirPractitioner;
  }
  resetForm(): void {
    if (confirm('Are you sure you want to reset all changes? This will restore the original values.')) {
      this.populateForm();
    }
  }

  navigateBack(): void {
    // Navigate back to the view page
    this.router.navigate(['/practitioners/view', this.practitionerId]);
  }
}