import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FastenApiService } from 'src/app/services/fasten-api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-setup-encryption-key',
  templateUrl: './setup-encryption-key.component.html',
  styleUrls: ['./setup-encryption-key.component.scss'],
})
export class SetupEncryptionKeyComponent implements OnInit {
  encryptionKeyForm: FormGroup;
  isProcessing = false;
  error = false;
  isValidated = false;
  statusMessage: string = '';
  countdown: number = 5;
  private countdownInterval: any;
  private formSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private fastenService: FastenApiService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
  ) {}

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  ngOnInit() {
    this.encryptionKeyForm = this.fb.group({
      encryptionKey: ['', Validators.required],
    });

  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  onEncryptionKeyChange(): void {
    if (this.encryptionKeyForm.get('encryptionKey')?.valid) {
      this.error = false;
      this.statusMessage = '';
    }
  }

  handleButtonClick(): void {
    if (this.isValidated) {
      this.redirectToDashboard();
    } else {
      this.validateAndSetKey();
    }
  }

  private initializeValidationProcess(): void {
    this.isProcessing = true;
    this.error = false;
    this.isValidated = false;
    this.encryptionKeyForm.get('encryptionKey')?.disable();
  }

  private handleSuccessfulSetup(): void {
    this.isValidated = true;
    this.isProcessing = false;
    this.statusMessage = 'Done! Redirecting...';
    this.startCountdown();
  }

  private handleError(errorMessage: string): void {
    this.isProcessing = false;
    this.error = true;
    this.statusMessage = errorMessage;
    this.encryptionKeyForm.get('encryptionKey')?.setErrors({ invalid: true });
    this.encryptionKeyForm.get('encryptionKey')?.enable();
    this.cdRef.detectChanges();
  }

  async validateAndSetKey(): Promise<void> {
    if (!this.encryptionKeyForm.valid) {
      return;
    }

    this.initializeValidationProcess();

    const encryptionKey = this.encryptionKeyForm.value.encryptionKey;

    try {
      this.statusMessage = 'Validating key...';
      this.cdRef.detectChanges();
      await this.sleep(500);
      await this.fastenService.validateEncryptionKey(encryptionKey).toPromise();
    } catch (err) {
      this.handleError('Invalid encryption key. Please check and try again.');
      return;
    }

    try {
      this.statusMessage = 'Setting up key...';
      this.cdRef.detectChanges();
      await this.sleep(500);
      await this.fastenService.setupEncryptionKey(encryptionKey).toPromise();

      this.handleSuccessfulSetup();
    } catch (err) {
      this.handleError('Failed to set up the encryption key. Please try again.');
    }
  }

  startCountdown(): void {
    this.countdown = 5;
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.redirectToDashboard();
      }
    }, 1000);
  }

  redirectToDashboard(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.router.navigate(['/']);
  }
}
