import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { FastenApiService } from '../services/fasten-api.service';

@Injectable()
export class ShowFirstRunWizardGuard implements CanActivate {
  constructor(
    private fastenService: FastenApiService,
    private router: Router
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    try {
      const healthData = await this.fastenService.getHealth().toPromise();

      if (healthData.first_run_wizard) {
        return await this.router.navigate(['/auth/signup/wizard']);
      }
    } catch (e: any) {
      if (e?.error?.error === 'no_encryption_token') {
        console.warn('No encryption token found. Redirecting to wizard.');
        return await this.router.navigate(['/setup-token']);
      }

      console.error('ignoring error:', e);
    }

    return true;
  }
}
