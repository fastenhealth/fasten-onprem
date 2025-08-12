import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FastenApiService } from 'src/app/services/fasten-api.service';
import { Observable } from 'rxjs';

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

  private handleApiResponse(
    apiCall: (encryptionKey: string) => Observable<any>,
    successCallback: () => void,
    errorCallback: () => void = () => {},
  ): void {
    if (!this.encryptionKeyForm.valid) return;

    this.loading = true;
    this.error = false;
    this.testSuccess = false;

    const encryptionKey = this.encryptionKeyForm.value.encryptionKey;

    apiCall(encryptionKey).subscribe({
      next: () => {
        successCallback();
        this.loading = false;
      },
      error: () => {
        this.error = true;
        errorCallback();
        this.loading = false;
      },
    });
  }

  testConnection(): void {
    this.handleApiResponse(
      (encryptionKey) => this.fastenService.validateEncryptionKey(encryptionKey),
      () => {
        this.testSuccess = true;
      },
      () => {
        this.encryptionKeyForm.get('encryptionKey')?.setErrors({ invalid: true });
        this.testSuccess = false;
      },
    );
  }

  onSubmit(): void {
    if (!this.testSuccess) return;

    this.handleApiResponse(
      (encryptionKey) => this.fastenService.setupEncryptionKey(encryptionKey),
      () => {
        this.isEncryptionKeySet = true;
        this.encryptionKeyForm.reset();
      },
    );
  }
}
