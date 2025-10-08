import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-oidc-callback',
  templateUrl: './oidc-callback.component.html',
  styleUrls: ['./oidc-callback.component.scss'],
})
export class OidcCallbackComponent implements OnInit {
  loading = true;
  success = false;
  errorMsg: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      this.errorMsg = 'Missing authorization token.';
      this.loading = false;
      this.router.navigate(['/auth/signin']);
      return;
    }

    try {
      await this.auth.completeOidcLogin(token);
      this.success = true;
      setTimeout(() => this.router.navigate(['/dashboard']), 1500);
    } catch (err: any) {
      console.error('OIDC callback error', err);
      this.errorMsg = err?.message || 'Failed to authenticate.';
      this.router.navigate(['/auth/signin']);
    } finally {
      this.loading = false;
    }
  }
}
