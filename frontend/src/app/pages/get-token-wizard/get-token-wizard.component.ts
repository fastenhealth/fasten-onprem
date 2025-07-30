import { Component, OnInit } from '@angular/core';
import { ToastNotification, ToastType } from 'src/app/models/fasten/toast';
import { FastenApiService } from 'src/app/services/fasten-api.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-get-token-wizard',
  templateUrl: './get-token-wizard.component.html',
  styleUrls: ['./get-token-wizard.component.scss'],
})
export class GetTokenWizardComponent implements OnInit {
  token: string | null = null;
  loading = false;
  error: string | null = null;
  tokenSaved = false; // tracks whether user copied or downloaded

  constructor(
    private fastenApiService: FastenApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.fetchToken();
  }

  fetchToken(): void {
    this.loading = true;
    this.error = null;

    this.fastenApiService.getToken().subscribe({
      next: (response) => {
        this.token = response;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to fetch token.';
        console.error(err);
        this.loading = false;
      },
    });
  }

  copyToClipboard(): void {
    if (this.token) {
      navigator.clipboard.writeText(this.token).then(() => {
        this.tokenSaved = true;
        const toastNotification = new ToastNotification();
        toastNotification.type = ToastType.Success;
        toastNotification.message = `Successfully copied token to clipboard!`;
        this.toastService.show(toastNotification);
      });
    }
  }

  downloadToken(): void {
    if (this.token) {
      const blob = new Blob([this.token], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'token.txt';
      a.click();

      URL.revokeObjectURL(url);
      this.tokenSaved = true;
      const toastNotification = new ToastNotification();
      toastNotification.type = ToastType.Success;
      toastNotification.message = `Successfully downloaded token!`;
      this.toastService.show(toastNotification);
    }
  }
}
