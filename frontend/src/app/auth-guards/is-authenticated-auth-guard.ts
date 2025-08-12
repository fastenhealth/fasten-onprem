import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FastenApiService } from '../services/fasten-api.service';

@Injectable()
export class IsAuthenticatedAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private fastenService: FastenApiService
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    // First, check if the server is running and accessible
    try {
      await this.fastenService.getHealth().toPromise();
    } catch (e: any) {
      if (e?.error?.error === 'server_standby') {
        console.warn('Server is on standby, encryption key needs to be restored.');
        return await this.router.navigate(['/encryption-key/wizard-restore']);
      }

      console.error('ignoring error:', e);
    }

    //check if the user is authenticated, if not, redirect to login
    if (!(await this.authService.IsAuthenticated())) {
      return await this.router.navigate(['/auth/signin']);
    }
    // continue as normal
    return true;
  }
}
