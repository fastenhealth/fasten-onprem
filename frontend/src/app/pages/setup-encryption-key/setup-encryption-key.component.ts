import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FastenApiService } from 'src/app/services/fasten-api.service';

@Component({
  selector: 'app-setup-encryption-key',
  templateUrl: './setup-encryption-key.component.html',
  styleUrls: ['./setup-encryption-key.component.scss'],
})
export class SetupEncryptionKeyComponent implements OnInit {
  encryptionKeyForm: FormGroup;
  isEncryptionKeySet = false;
  testSuccess = false;
  loading = false;
  error = false;

  constructor(
    private fb: FormBuilder,
    private fastenService: FastenApiService,
  ) {}

  ngOnInit() {
    this.encryptionKeyForm = this.fb.group({
      encryptionKey: ['', Validators.required],
    });
  }

  testConnection(): void {
    if (!this.encryptionKeyForm.valid) return;

    this.loading = true;
    this.error = false;
    this.testSuccess = false;

    const formData = new URLSearchParams();
    formData.append('encryption_key', this.encryptionKeyForm.value.encryptionKey);

    this.fastenService.validateEncryptionKey(formData.toString()).subscribe({
      next: () => {
        this.testSuccess = true;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.encryptionKeyForm.get('encryptionKey')?.setErrors({ invalid: true });
        this.loading = false;
        this.testSuccess = false;
      },
    });
  }

  onSubmit(): void {
    if (!this.encryptionKeyForm.valid || !this.testSuccess) return;

    this.loading = true;
    this.error = false;

    const formData = new URLSearchParams();
    formData.append('encryption_key', this.encryptionKeyForm.value.encryptionKey);

    this.fastenService.setupEncryptionKey(formData.toString()).subscribe({
      next: () => {
        this.isEncryptionKeySet = true;
        this.loading = false;
        this.encryptionKeyForm.reset();
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }
}
