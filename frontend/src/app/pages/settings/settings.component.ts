import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import QRCode from 'qrcode';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  tokens: any[] = [];
  qrCodeUrl: SafeUrl | null = null;
  qrCodeData: string = '';
  isLoading: boolean = false;
  hasError: boolean = false;
  isRawQrCodeCollapsed: boolean = true;
  errorMessage: string = '';
  accessToken: string = '';
  serverInfo: any = null;
  currentUser: any = null;
  newDeviceName: string = '';
  newDeviceExpiration: number = 0; // 0 for no expiration, otherwise days
  expirationOptions = [
    { value: 0, label: 'No Expiration' },
    { value: 7, label: '7 Days' },
    { value: 30, label: '30 Days' },
    { value: 60, label: '60 Days' },
    { value: 90, label: '90 Days' },
  ];
  step: 'askDetails' | 'showQR' = 'askDetails';

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadTokens();
  }

  loadCurrentUser(): void {
    const token = localStorage.getItem('token');

    this.http.get<any>('/api/secure/account/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        if (response && response.success) {
          this.currentUser = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading current user:', error);
      }
    });
  }

  generateAccessToken(): void {
    const token = localStorage.getItem('token');

    console.log('Generating access token...');
    this.isLoading = true;

    const body: { name?: string; expiration?: number } = {};
    if (this.newDeviceName) {
      body.name = this.newDeviceName;
    }
    if (this.newDeviceExpiration !== undefined) {
      body.expiration = this.newDeviceExpiration;
    }

    this.http.post<any>('/api/secure/access/token', body, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        console.log('Generate token response:', response);
        if (response.success) {
          this.accessToken = response.data;
          this.loadTokens();
          this.getServerDiscovery();
          this.newDeviceName = ''; // Clear the input after successful generation
          this.step = 'showQR'; // Move to the QR code display step
        } else {
          console.error('Failed to generate access token');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error generating access token:', error);
        this.isLoading = false;
      }
    });
  }

  generateAndShowQR(content: any): void {
    this.step = 'askDetails';
    this.newDeviceName = '';
    this.newDeviceExpiration = 0; // Reset to default
    this.qrCodeUrl = null;
    this.qrCodeData = '';

    this.modalService.open(content, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    }).result.then(
      (result) => {
        this.step = 'askDetails';
      },
      (reason) => {
        this.step = 'askDetails';
      }
    );
  }

  connectDevice(): void {
    this.isLoading = true;
    this.generateAccessToken();
  }

  getServerDiscovery(): void {
    const token = localStorage.getItem('token');

    this.http.get<any>('/api/secure/sync/discovery', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.serverInfo = response.data;
          this.generateQRCode();
        }
      },
      error: (error) => {
        console.error('Error getting server discovery:', error);
      }
    });
  }

  generateQRCode(): void {
    if (!this.accessToken || !this.serverInfo) {
      return;
    }

    const qrData = {
      token: this.accessToken,
      server_base_urls: this.serverInfo.server_base_urls,
      sync_endpoint: this.serverInfo.sync_endpoint,
    };

    this.qrCodeData = JSON.stringify(qrData, null, 2);

    try {
      QRCode.toDataURL(this.qrCodeData, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
        .then((url) => {
          this.qrCodeUrl = this.sanitizer.bypassSecurityTrustUrl(url);
          // Modal will be opened by the button click
        })
        .catch((error) => {
          console.error('QR Code generation error:', error);
          this.setError('Failed to generate QR code: ' + error.message);
        });
    } catch (error) {
      console.error('QR Code generation caught error:', error);
      this.setError('Failed to generate QR code: ' + (error as Error).message);
    }
  }

  loadTokens(): void {
    const token = localStorage.getItem('token');

    this.http.get<any>('/api/secure/access/token', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        const list = response && response.success ? (response.data || []) : [];
        this.tokens = list.map((t: any) => ({
          ...t,
          name: t.name,
          status: t.status,
          issuedAt: t.issued_at,
          expiresAt: t.expires_at,
          tokenId: t.token_id,
        }));
      },
      error: (error) => {
        console.error('Error loading access tokens:', error);
        this.tokens = [];
      }
    });
  }


  deleteToken(tokenId: string): void {
    const token = localStorage.getItem('token');

    if (confirm('Are you sure you want to delete this access token?')) {
      this.http.delete<any>('/api/secure/access/token', { 
        body: { token_id: tokenId },
        headers: { Authorization: `Bearer ${token}` } 
      }).subscribe({
        next: () => {
          this.loadTokens();
          // Clear QR code data if this was the current token
          this.qrCodeUrl = null;
          this.qrCodeData = '';
          this.accessToken = '';
        },
        error: (error) => {
          this.setError('Error deleting token');
        }
      });
    }
  }

  formatDate(dateString: string | Date): string {
    if (!dateString) {
      return 'N/A';
    }
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString();
  }

  formatExpiryDate(dateString: string | Date): string {
    if (!dateString) {
      return 'N/A';
    }
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    };
    return `on ${date.toLocaleDateString('en-US', options)}`;
  }

  copyRawQR(): void {
    if (this.qrCodeData) {
      navigator.clipboard.writeText(this.qrCodeData);
    }
  }

  openQRModal(content: any): void {
    this.modalService.open(content, {
      size: 'lg',
      centered: true
    });
  }

  private setError(message: string): void {
    this.hasError = true;
    this.errorMessage = message;
  }
}
