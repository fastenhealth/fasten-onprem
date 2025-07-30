import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
    private http: HttpClient,
    private fastenService: FastenApiService
  ) {}

  ngOnInit() {
    this.tokenForm = this.fb.group({
      token: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.tokenForm.valid) {
      const formData = new URLSearchParams();
      formData.append('token', this.tokenForm.value.token);
      this.fastenService.setupToken(formData.toString()).subscribe(
        () => {
          this.isTokenSet = true;
          this.error = false;
        },
        () => {
          this.isTokenSet = false;
          this.error = true;
        }
      );
    }
  }
}
