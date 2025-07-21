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
  isLoading = false;
  hasError = false;
  errorMessage = '';
  qrCodeUrl: SafeUrl = '';
  qrCodeRaw: string = '';
  tokens: any[] = [];
  history: any[] = [];
  deviceSyncHistory: any[] = [];
  private ctrl: AbortController | null = null;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadTokens();
    this.loadHistory();
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
            this.loadHistory();
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

  generateToken(): void {
    this.isLoading = true;
    this.hasError = false;
    
    const token = localStorage.getItem('token');
    
    this.http.get<any>('/api/secure/sync/initiate', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        if (response.success) {
          // Get current host for QR code
          const currentHost = window.location.hostname;
          const currentPort = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
          
          // Get multiple server addresses from backend response
          const serverAddresses = response.data.addresses || [`${currentHost}:${response.data.port || currentPort}`];
          const primaryAddress = response.data.address || currentHost;
          const serverPort = response.data.port || currentPort;
          
          const qrData = JSON.stringify({
            token: response.data.token,
            port: serverPort,
            address: primaryAddress,
            addresses: serverAddresses, // Multiple addresses for network resilience
            serverInfo: response.data.serverInfo || {
              name: "Fasten Health Server",
              version: "1.0.0",
              docker: true
            },
            expiresAt: response.data.expiresAt,
            tokenId: response.data.tokenId,
            // Legacy format for backward compatibility
            server: {
              host: primaryAddress,
              port: serverPort,
              protocol: window.location.protocol.replace(':', ''),
            },
            app: {
              name: 'Health Wallet',
              version: '1.0.0',
              sync_endpoint: '/api/secure/sync/data',
            },
            metadata: {
              generated_at: new Date().toISOString(),
              expires_in: '24h',
              scopes: ['sync:read', 'sync:write'],
            }
          }, null, 2);
          
          console.log('QR Code Data:', qrData);
          console.log('QR Code Data Length:', qrData.length);
          
          this.qrCodeRaw = qrData;
          
          // Add error handling and debugging for QR code generation
          try {
            QRCode.toDataURL(qrData, {
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
            })
            .catch((error) => {
              console.error('QR Code generation error:', error);
              this.setError('Failed to generate QR code: ' + error.message);
            });
          } catch (error) {
            console.error('QR Code generation caught error:', error);
            this.setError('Failed to generate QR code: ' + (error as Error).message);
          }
          
          this.loadTokens(); // Refresh token list
        } else {
          this.setError('Failed to generate token');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Token generation error:', error);
        this.setError('Error: ' + (error.error?.error || error.message));
        this.isLoading = false;
      }
    });
  }

  loadTokens(): void {
    const token = localStorage.getItem('token');
    
    this.http.get<any>('/api/secure/sync/tokens', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.tokens = response.success ? (response.data || []).map((t: any) => ({...t, lastUsedAt: t.lastUsedAt ? new Date(t.lastUsedAt) : null})) : [];
      },
      error: () => {
        this.tokens = [];
      }
    });
  }

  loadHistory(): void {
    const token = localStorage.getItem('token');
    
    this.http.get<any>('/api/secure/sync/history', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.history = response.success ? (response.data?.events || []) : [];
      },
      error: () => {
        this.history = [];
      }
    });
  }

  loadDeviceSyncHistory(): void {
    const token = localStorage.getItem('token');
    this.http.get<any>('/api/secure/sync/device-history', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.deviceSyncHistory = response.success ? (response.data?.events || response.data || []) : [];
      },
      error: () => {
        this.deviceSyncHistory = [];
      }
    });
  }

  revokeToken(tokenId: string): void {
    const token = localStorage.getItem('token');
    
    this.http.post<any>('/api/secure/sync/revoke', 
      { tokenId }, 
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        this.loadTokens();
        this.loadHistory();
      },
      error: (error) => {
        this.setError('Error revoking token');
      }
    });
  }

  revokeAllTokens(): void {
    const token = localStorage.getItem('token');
    
    this.http.post<any>('/api/secure/sync/revoke', 
      { all: true }, 
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        this.loadTokens();
        this.qrCodeUrl = '';
        this.loadHistory();
      },
      error: (error) => {
        this.setError('Error revoking tokens');
      }
    });
  }

  deleteToken(tokenId: string): void {
    const token = localStorage.getItem('token');
    this.http.post<any>('/api/secure/sync/delete',
      { tokenId },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        this.loadTokens();
        this.loadHistory();
      },
      error: (error) => {
        this.setError('Error deleting token');
      }
    });
  }

  deleteAllTokens(): void {
    const token = localStorage.getItem('token');
    this.http.post<any>('/api/secure/sync/delete-all',
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        this.loadTokens();
        this.qrCodeUrl = '';
        this.loadHistory();
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
    if (this.qrCodeRaw) {
      navigator.clipboard.writeText(this.qrCodeRaw);
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
