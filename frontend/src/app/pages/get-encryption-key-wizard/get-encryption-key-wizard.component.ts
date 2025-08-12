import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastNotification, ToastType } from 'src/app/models/fasten/toast';
import { FastenApiService } from 'src/app/services/fasten-api.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-get-encryption-key-wizard',
  templateUrl: './get-encryption-key-wizard.component.html',
  styleUrls: ['./get-encryption-key-wizard.component.scss'],
})
export class GetEncryptionKeyWizardComponent implements OnInit {
  encryptionKey: string | null = null;
  loading = false;
  error: string | null = null;
  encryptionKeyDownloaded = false;
  acknowledged = false;
  showEncryptionKey = false;

  constructor(
    private fastenApiService: FastenApiService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchEncryptionKey();
  }

  fetchEncryptionKey(): void {
    this.loading = true;
    this.error = null;

    this.fastenApiService.getEncryptionKey().subscribe({
      next: (response) => {
        this.encryptionKey = response;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to fetch encryption key.';
        console.error(err);
        this.loading = false;
      },
    });
  }

  toggleEncryptionKeyVisibility(): void {
    this.showEncryptionKey = !this.showEncryptionKey;
  }

  copyToClipboard(): void {
    if (this.encryptionKey) {
      navigator.clipboard.writeText(this.encryptionKey).then(() => {
        const toastNotification = new ToastNotification();
        toastNotification.type = ToastType.Success;
        toastNotification.message = `Successfully copied encryption key to clipboard!`;
        this.toastService.show(toastNotification);
      });
    }
  }

  downloadEncryptionKey(): void {
    if (this.encryptionKey) {
      const blob = new Blob([this.encryptionKey], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'encryption_key.txt';
      a.click();
      URL.revokeObjectURL(url);

      this.encryptionKeyDownloaded = true;

      const toastNotification = new ToastNotification();
      toastNotification.type = ToastType.Success;
      toastNotification.message = `Successfully downloaded encryption key!`;
      this.toastService.show(toastNotification);
    }
  }

  proceedToSignup(): void {
    if (this.encryptionKey) {
      this.downloadEncryptionKey();
    }
    this.router.navigate(['/auth/signup/wizard']);
  }
}
