import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { HighlightModule } from 'ngx-highlightjs';
import { NlmTypeaheadComponent } from '../../components/nlm-typeahead/nlm-typeahead.component';
import { FastenApiService } from '../../services/fasten-api.service';
import { PractitionerModel } from '../../../lib/models/resources/practitioner-model';
import { AddressModel } from '../../../lib/models/datatypes/address-model';
import { ResponseWrapper } from '../../models/response-wrapper';
import { parseFullName } from 'parse-full-name';
import { uuidV4 } from '../../../lib/utils/uuid';

@Component({
  selector: 'app-add-practitioner',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgbTooltipModule,
    HighlightModule,
    NlmTypeaheadComponent
  ],
  templateUrl: './practitioner-create.component.html',
  styleUrls: ['./practitioner-create.component.scss']
})
export class PractitionerCreateComponent implements OnInit {
  debugMode: boolean = false;
  isSubmitting: boolean = false;
  
  newPractitionerTypeaheadForm: FormGroup;
  newPractitionerForm: FormGroup;
  
  totalPractitioners: number = 0;

  constructor(
    private router: Router,
    private fastenApi: FastenApiService
  ) { }

  ngOnInit(): void {
    this.initializeForms();
    this.loadPractitionerCount();
  }

  private initializeForms(): void {
    this.resetPractitionerForm();
  }

  private loadPractitionerCount(): void {
    this.fastenApi.queryResources({
      "select": [],
      "from": "Practitioner",
      "where": {},
      "aggregations": {
        "count_by": {"field": "*"}
      }
    }).subscribe((resp: ResponseWrapper) => {
      this.totalPractitioners = resp.data?.[0].value || 0;
    });
  }

  get submitEnabled(): boolean {
    return this.newPractitionerForm.valid && !this.isSubmitting;
  }

  navigateBack(): void {
    this.router.navigate(['/practitioners']);
  }

  resetForm(): void {
    this.resetPractitionerForm();
  }

  submit(): void {
    this.newPractitionerForm.markAllAsTouched();
    
    if (this.newPractitionerForm.valid) {
      this.isSubmitting = true;
      const practitionerModel = this.practitionerFormToDisplayModel(this.newPractitionerForm);
      this.createPractitioner(practitionerModel);
    }
  }

  private createPractitioner(practitionerModel: PractitionerModel): void {
    // Convert the model to the format expected by your API
    const practitionerData = this.convertToApiFormat(practitionerModel);
    
    // Transform to proper FHIR format
    const fhirPractitioner = {
      resourceType: 'Practitioner',
      id: practitionerData.id,
      name: this.formatName(practitionerData.name || practitionerData.full_name),
      identifier: practitionerData.identifier || [],
      address: this.formatAddress(practitionerData.address),
      telecom: this.formatTelecom(practitionerModel), // Fixed this line
      active: true,
      qualification: this.formatQualification(practitionerData.qualification || [])
    };
    
    console.log('Final FHIR practitioner:', fhirPractitioner);
    
    // Create the practitioner using the available API method
    this.fastenApi.createPractitioner(fhirPractitioner).subscribe(
      (response) => {
        console.log('Practitioner created successfully:', response);
        this.isSubmitting = false;
        
        // Show success message and navigate back
        alert('Practitioner created successfully!');
        this.navigateBack();
      },
      (error) => {
        console.error('Error creating practitioner:', error);
        this.isSubmitting = false;
        
        // Show error message
        const errorMessage = error?.error?.error || error.message || 'Unknown error';
        alert(`Failed to create practitioner: ${errorMessage}`);
      }
    );
  }

  private formatTelecom(practitionerModel: PractitionerModel): any[] {
    const telecom = [];
    
    if (practitionerModel.telecom && Array.isArray(practitionerModel.telecom)) {
      // Use the telecom array from the model
      practitionerModel.telecom.forEach(contact => {
        if (contact.value) {
          telecom.push({
            system: contact.system,
            value: contact.value,
            use: contact.use || 'work'
          });
        }
      });
    }
    
    return telecom;
  }

  private formatName(nameString: string): any[] {
    if (!nameString) return [];
    
    // Parse "LASTNAME, FIRSTNAME" format
    const parts = nameString.split(',').map(part => part.trim());
    const familyName = parts[0] || '';
    const givenName = parts[1] || '';
    
    // Convert to proper case (first letter uppercase, rest lowercase)
    const familyProperCase = this.toProperCase(familyName);
    const givenProperCase = this.toProperCase(givenName);
    
    return [{
      family: familyProperCase,
      given: givenProperCase ? [givenProperCase] : [],
      suffix: [''],
      text: nameString, // Keep original text as is
      use: 'official'
    }];
  }

  private formatAddress(address: any): any[] {
    if (!address) return [];
    
    // Clean the line array to remove null/undefined values
    const cleanLines = address.line ? 
      address.line.filter(line => line !== null && line !== undefined && line !== '') : [];
    
    const fhirAddress = {
      use: "home",
      type: "physical", 
      line: cleanLines,
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || 'US'
    };
    
    return [fhirAddress];
  }

  private formatQualification(qualifications: any[]): any[] {
    if (!qualifications || !Array.isArray(qualifications)) {
      // If no qualifications array, check if we have profession from form
      const profession = this.newPractitionerForm.get('profession')?.value;
      if (profession?.text) {
        return [{
          code: {
            text: profession.text
          }
        }];
      }
      return [];
    }
    
    return qualifications.map(qual => ({
      code: {
        coding: [{
          system: qual.system || 'http://nucc.org/provider-taxonomy',
          code: qual.code,
          display: qual.display
        }],
        text: qual.text || qual.display
      }
    }));
  }

  private toProperCase(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  private convertToApiFormat(practitioner: PractitionerModel): any {
    return {
      id: practitioner.source_resource_id,
      name: practitioner.name?.[0]?.displayName || '',
      full_name: practitioner.name?.[0]?.displayName || '',
      address: practitioner.address?.[0] ? {
        line: practitioner.address[0].line,
        city: practitioner.address[0].city,
        state: practitioner.address[0].state,
        postalCode: practitioner.address[0].postalCode,
        country: practitioner.address[0].country
      } : null,
      telecom: practitioner.telecom?.[0] ? {
        system: practitioner.telecom[0].system,
        value: practitioner.telecom[0].value,
        use: practitioner.telecom[0].use
      } : null,
      qualification: practitioner.qualification,
      identifier: practitioner.identifier
    };
  }

  private practitionerFormToDisplayModel(form: FormGroup): PractitionerModel {
    let address = new AddressModel(null);
    address.city = form.get('address')?.get('city')?.value;
    address.line = [
      form.get('address')?.get('line1')?.value,
      form.get('address')?.get('line2')?.value,
    ].filter(line => line);
    address.state = form.get('address')?.get('state')?.value;
    address.country = form.get('address')?.get('country')?.value;
    address.postalCode = form.get('address')?.get('zip')?.value;
  
    let model = new PractitionerModel({});
    model.source_resource_id = form.get('id')?.value;
    model.identifier = form.get('identifier')?.value || [];
    model.name = [];
    model.address = [address];
    model.telecom = [];
    model.qualification = [];
    
    // Add telecom entries
    if (form.get('phone')?.value) {
      model.telecom.push({
        system: 'phone',
        value: form.get('phone')?.value,
        use: 'work'
      });
    }
    
    if (form.get('fax')?.value) {
      model.telecom.push({
        system: 'fax',
        value: form.get('fax')?.value,
        use: 'work'
      });
    }
    
    if (form.get('email')?.value) {
      model.telecom.push({
        system: 'email',
        value: form.get('email')?.value,
        use: 'work'
      });
    }
    
    const professionValue = form.get('profession')?.value;
    if (professionValue) {
      if (professionValue.identifier && Array.isArray(professionValue.identifier)) {
        model.qualification = professionValue.identifier;
      } else if (professionValue.text) {
        model.qualification = [{
          code: professionValue.text, 
          display: professionValue.text,
          system: 'http://nucc.org/provider-taxonomy'
        }];
      }
    }
    
    if (form.get('name')?.value) {
      let nameParts = parseFullName(form.get('name')?.value);
      model.name.push({
        givenName: nameParts.first,
        familyName: nameParts.last,
        suffix: nameParts.suffix,
        textName: form.get('name')?.value,
        use: 'official',
        displayName: form.get('name')?.value,
      });
    }
  
    if (!model.source_resource_id) {
      console.warn("No source_resource_id set for Practitioner, generating one");
      model.source_resource_id = uuidV4();
    }
  
    return model;
  }

  private resetPractitionerForm(): void {
    this.newPractitionerTypeaheadForm = new FormGroup({
      data: new FormControl(null, Validators.required),
    });
    
    this.newPractitionerTypeaheadForm.valueChanges.subscribe(form => {
      let val = form.data;
      
      if (val == null) {
        // Reset the dependent fields (user cleared the text box)
        this.newPractitionerForm.get('id')?.setValue(null);
        this.newPractitionerForm.get('profession')?.setValue(null);
        this.newPractitionerForm.get('identifier')?.setValue(null);
        this.newPractitionerForm.get('phone')?.setValue(null);
        this.newPractitionerForm.get('fax')?.setValue(null);
        this.newPractitionerForm.get('email')?.setValue(null);
        
        let addressGroup = this.newPractitionerForm.get('address');
        addressGroup?.get('line1')?.setValue(null);
        addressGroup?.get('line2')?.setValue(null);
        addressGroup?.get('city')?.setValue(null);
        addressGroup?.get('state')?.setValue(null);
        addressGroup?.get('zip')?.setValue(null);
        addressGroup?.get('country')?.setValue(null);
        
        this.newPractitionerForm.get('name')?.setValue(null);
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
}