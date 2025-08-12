import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { FastenApiService } from '../services/fasten-api.service';

interface Health {
  first_run_wizard: boolean;
  encryption_enabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EncryptionStatusGuard implements CanActivate {
  constructor(private fastenService: FastenApiService, private router: Router) { }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    try {
      const healthData: Health = await this.fastenService.getHealth().toPromise();

      if (!healthData.encryption_enabled) {
        // If encryption is not enabled, bypass this guard
        return true;
      }

      if (healthData.first_run_wizard) {
        // If first run wizard is required, navigate to encryption setup
        return await this.router.navigate(['/encryption-key/wizard']);
      }
    } catch (e: any) {
      if (e?.error?.error === 'server_standby') {
        // If server is on standby, encryption key needs to be restored
        console.warn('Server is on standby, encryption key needs to be restored.');
        return await this.router.navigate(['/encryption-key/wizard-restore']);
      }

      console.error("ignoring error:", e);
    }
    // Continue as normal if no encryption issues
    return true;
  }
}
