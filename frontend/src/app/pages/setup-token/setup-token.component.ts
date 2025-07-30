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
  error = false;

  constructor(
    private fb: FormBuilder,
    private fastenService: FastenApiService
  ) {}

  ngOnInit() {
    this.tokenForm = this.fb.group({
      token: ['', Validators.required],
    });
  }

  onSubmit() {
    if (!this.tokenForm.valid) return;

    this.error = false;
    this.isTokenSet = false;

    const formData = new URLSearchParams();
    formData.append('token', this.tokenForm.value.token);

    this.fastenService.setupToken(formData.toString()).subscribe({
      next: () => {
        this.isTokenSet = true;
        this.tokenForm.reset();
      },
      error: () => {
        this.error = true;
        console.error('Failed to set token.');},
    });
  }
}
