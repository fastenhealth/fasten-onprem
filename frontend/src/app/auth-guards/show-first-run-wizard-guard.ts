import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
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

      if (healthData?.first_run_wizard) {
        return await this.router.navigate(['/token/wizard']);
      }
    } catch (e: any) {
      if (e?.error?.error === 'server_standby') {
        console.warn('Server is on standby, token needs to be restored.');
        return await this.router.navigate(['/token/wizard-restore']);
      }

      console.error('ignoring error:', e);
    }

    return true;
  }
}
