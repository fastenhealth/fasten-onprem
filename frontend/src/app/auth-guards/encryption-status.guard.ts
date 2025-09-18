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

      if (healthData.standby_mode) {
        if (healthData.first_run_wizard) {
          return await this.router.navigate(['encryption-key/wizard']);
        } else {
          return await this.router.navigate(['encryption-key/wizard-restore']);
        }
      }

      if (healthData.first_run_wizard) {
        return await this.router.navigate(['/auth/signup/wizard']);
      }
    } catch (e: any) {
      // If there is an error, log it and allow navigation to continue.
      console.error('Error in EncryptionStatusGuard, ignoring and continuing navigation:', e);
    }
    // continue as normal
    return true;
  }
}
