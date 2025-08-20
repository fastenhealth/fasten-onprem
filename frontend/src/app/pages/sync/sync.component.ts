import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import QRCode from 'qrcode';
import { fetchEventSource } from '@microsoft/fetch-event-source';

@Component({
  selector: 'app-sync',
  templateUrl: './sync.component.html',
  styleUrls: ['./sync.component.scss'],
})
export class SyncComponent implements OnInit, OnDestroy {
  tokens: any[] = [];
  deviceSyncHistory: any[] = [];
  qrCodeUrl: SafeUrl | null = null;
  qrCodeRaw: string = '';
  qrCodeData: string = '';
  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';
  accessToken: string = '';
  serverInfo: any = null;
  private ctrl: AbortController | null = null;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadTokens();
    this.loadDeviceSyncHistory();
    this.connectToEventStream();
  }

  ngOnDestroy(): void {
    if (this.ctrl) {
      this.ctrl.abort();
    }
  }

  private connectToEventStream(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.ctrl = new AbortController();
      fetchEventSource('/api/secure/events/stream', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: this.ctrl.signal,
        onmessage: (event) => {
          const eventData = JSON.parse(event.data);
          // NOTE: you can uncomment the following line to see the raw event data
          // console.log('SSE event received:', eventData);

          // Check for different event types and update data accordingly
          if (eventData.event_type === 'source:sync:complete' || eventData.event_type === 'token:revoked' || eventData.event_type === 'token:deleted') {
            this.loadTokens();
            this.loadDeviceSyncHistory();
          }
        },
        onerror: (error) => {
          console.error('EventSource failed:', error);
          // The library will automatically try to reconnect.
          // We re-throw the error to stop the retries.
          throw error;
        }
      });
    }
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
          // Store the access token
          this.accessToken = response.data.token;
          console.log('Access token stored:', this.accessToken);
          
          // Refresh tokens list immediately
          this.loadTokens();
          
          // Get server discovery info separately
          this.getServerDiscovery();
          
          console.log('Access token generated successfully!');
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

  getServerDiscovery(): void {
    const token = localStorage.getItem('token');
    
    console.log('Getting server discovery...');
    
    this.http.get<any>('/api/secure/sync/discovery', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        console.log('Server discovery response:', response);
        if (response.success) {
          this.serverInfo = response.data;
          console.log('Server info stored:', this.serverInfo);
          this.generateQRCode();
          console.log('Server discovery successful');
        }
      },
      error: (error) => {
        console.error('Error getting server discovery:', error);
      }
    });
  }

  generateQRCode(): void {
    console.log('Generating QR code...');
    console.log('Access token:', this.accessToken);
    console.log('Server info:', this.serverInfo);
    
    if (!this.accessToken || !this.serverInfo) {
      console.log('Missing access token or server info, cannot generate QR code');
      return;
    }

    // Create minimal QR code data with only necessary information
    const qrData = {
      token: this.accessToken,
      server: this.serverInfo.connection,
      endpoints: this.serverInfo.endpoints,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    console.log('QR data created:', qrData);

    // Generate QR code
    this.qrCodeData = JSON.stringify(qrData, null, 2);
    console.log('QR code data stringified:', this.qrCodeData);
    
    // Generate QR code image
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
        console.log('QR Code generated successfully');
        this.qrCodeUrl = this.sanitizer.bypassSecurityTrustUrl(url);
        console.log('QR code URL set:', this.qrCodeUrl);
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
    
    console.log('Loading access tokens...');
    
    this.http.get<any>('/api/secure/access/tokens', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        console.log('Access tokens response:', response);
        const list = response && response.success ? (response.data?.tokens || []) : [];
        this.tokens = list.map((t: any) => ({
          // passthrough
          ...t,
          // normalized fields expected by template/helpers
          name: t.name,
          status: t.status,
          isActive: t.is_active,
          isRevoked: t.is_revoked,
          issuedAt: t.issued_at,
          expiresAt: t.expires_at,
          lastUsedAt: t.last_used_at ? new Date(t.last_used_at) : null,
          tokenId: t.token_id,
          useCount: t.use_count,
          serverInfo: t.server_info,
        }));
        console.log('Processed tokens:', this.tokens);
      },
      error: (error) => {
        console.error('Error loading access tokens:', error);
        this.tokens = [];
      }
    });
  }

  loadDeviceSyncHistory(): void {
    const token = localStorage.getItem('token');
    this.http.get<any>('/api/secure/access/device-history', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.deviceSyncHistory = response && response.success ? (response.data?.history || []) : [];
      },
      error: (error) => {
        console.error('Error loading device sync history:', error);
        this.deviceSyncHistory = [];
      }
    });
  }

  revokeToken(tokenId: string): void {
    const token = localStorage.getItem('token');
    
    this.http.post<any>('/api/secure/access/revoke', 
      { token_id: tokenId }, 
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        this.loadTokens();
        this.loadDeviceSyncHistory();
        // Clear QR code and raw data when a token is revoked
        this.qrCodeUrl = '' as any;
        this.qrCodeData = '';
        this.accessToken = '';
      },
      error: (error) => {
        this.setError('Error revoking token');
      }
    });
  }

  revokeAllTokens(): void {
    const token = localStorage.getItem('token');
    
    this.http.post<any>('/api/secure/access/revoke-all', 
      {}, 
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        this.loadTokens();
        // Clear QR code and raw data when all tokens are revoked
        this.qrCodeUrl = '' as any;
        this.qrCodeData = '';
        this.accessToken = '';
        this.loadDeviceSyncHistory();
      },
      error: (error) => {
        this.setError('Error revoking tokens');
      }
    });
  }

  deleteToken(tokenId: string): void {
    const token = localStorage.getItem('token');
    this.http.post<any>('/api/secure/access/delete',
      { token_id: tokenId },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        this.loadTokens();
        this.loadDeviceSyncHistory();
        // Clear QR code and raw data when a token is deleted
        this.qrCodeUrl = '' as any;
        this.qrCodeData = '';
        this.accessToken = '';
      },
      error: (error) => {
        this.setError('Error deleting token');
      }
    });
  }

  deleteAllTokens(): void {
    const token = localStorage.getItem('token');
    this.http.post<any>('/api/secure/access/delete-all',
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        this.loadTokens();
        // Clear QR code and raw data when all tokens are deleted
        this.qrCodeUrl = '' as any;
        this.qrCodeData = '';
        this.accessToken = '';
        this.loadDeviceSyncHistory();
      },
      error: (error) => {
        this.setError('Error deleting all tokens');
      }
    });
  }

  formatDate(dateString: string | Date): string {
    if (!dateString) {
      return 'N/A';
    }
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString();
  }

  copyRawQR(): void {
    const payload = this.qrCodeData || this.qrCodeRaw;
    if (payload) {
      navigator.clipboard.writeText(payload);
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

  private setError(message: string): void {
    this.hasError = true;
    this.errorMessage = message;
  }
}
