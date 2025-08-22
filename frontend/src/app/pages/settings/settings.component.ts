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
  errorMessage: string = '';
  accessToken: string = '';
  serverInfo: any = null;
  currentUser: any = null;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private modalService: NgbModal
  ) {}

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

    this.http.post<any>('/api/secure/sync/initiate', {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        console.log('Generate token response:', response);
        if (response.success) {
          this.accessToken = response.data.token;
          this.loadTokens();
          this.getServerDiscovery();
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
    // Open modal immediately for better UX
    this.modalService.open(content, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });

    // Generate token in background
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
      connections: this.serverInfo.connections,
      endpoints: this.serverInfo.endpoints,
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

    this.http.get<any>('/api/secure/access/tokens', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        const list = response && response.success ? (response.data?.tokens || []) : [];
        this.tokens = list.map((t: any) => ({
          ...t,
          name: t.name,
          status: t.status,
          isActive: t.is_active,
          isRevoked: t.is_revoked,
          issuedAt: t.issued_at,
          expiresAt: t.expires_at,
          lastUsedAt: t.last_used_at ? new Date(t.last_used_at) : null,
          tokenId: t.token_id,
          useCount: t.use_count,
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
      this.http.post<any>('/api/secure/access/delete',
        { token_id: tokenId },
        { headers: { Authorization: `Bearer ${token}` } }
      ).subscribe({
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

  copyRawQR(): void {
    if (this.qrCodeData) {
      navigator.clipboard.writeText(this.qrCodeData);
    }
  }

  getTokenStatus(token: any): string {
    const now = new Date();
    if (token.isRevoked) {
      return 'Revoked';
    }
    if (token.expiresAt && new Date(token.expiresAt) < now) {
      return 'Expired';
    }
    if (!token.isActive) {
      return 'Suspended';
    }
    return 'Active';
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
