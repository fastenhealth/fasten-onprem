import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FastenApiService } from 'src/app/services/fasten-api.service';

@Component({
  selector: 'app-setup-token',
  templateUrl: './setup-token.component.html',
  styleUrls: ['./setup-token.component.scss'],
})
export class SetupTokenComponent implements OnInit {
  tokenForm: FormGroup;
  isTokenSet = false;
  testSuccess = false;
  loading = false;
  error = false;

  constructor(
    private fb: FormBuilder,
    private fastenService: FastenApiService,
  ) {}

  ngOnInit() {
    this.tokenForm = this.fb.group({
      token: ['', Validators.required],
    });
  }

  testConnection(): void {
    if (!this.tokenForm.valid) return;

    this.loading = true;
    this.error = false;
    this.testSuccess = false;

    const formData = new URLSearchParams();
    formData.append('token', this.tokenForm.value.token);

    this.fastenService.testToken(formData.toString()).subscribe({
      next: () => {
        this.testSuccess = true;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.tokenForm.get('token')?.setErrors({ invalid: true });
        this.loading = false;
        this.testSuccess = false;
      },
    });
  }

  onSubmit(): void {
    if (!this.tokenForm.valid || !this.testSuccess) return;

    this.loading = true;
    this.error = false;

    const formData = new URLSearchParams();
    formData.append('token', this.tokenForm.value.token);

    this.fastenService.setupToken(formData.toString()).subscribe({
      next: () => {
        this.isTokenSet = true;
        this.loading = false;
        this.tokenForm.reset();
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }
}
