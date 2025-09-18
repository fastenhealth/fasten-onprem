import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { FastenApiService } from '../services/fasten-api.service';

interface Health {
  first_run_wizard: boolean;
  standby_mode: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class EncryptionStatusGuard implements CanActivate {
  constructor(
    private fastenService: FastenApiService,
    private router: Router
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    try {
      const healthData: Health = await this.fastenService
        .getHealth()
        .toPromise();

      if (!healthData.standby_mode) {
        return true;
      }

      if (healthData.first_run_wizard) {
        return await this.router.navigate(['encryption-key/wizard']);
      }

      return await this.router.navigate(['encryption-key/wizard-restore']);
    } catch (e: any) {
      // if there is an error, just ignore it, and continue to the page.
      console.error('ignoring error:', e);
    }
    // continue as normal
    return true;
  }
}
