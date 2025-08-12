import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {FastenApiService} from '../services/fasten-api.service';

@Injectable()
export class ShowFirstRunWizardGuard implements CanActivate {
  constructor(private fastenService: FastenApiService, private router: Router) {

  }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise <boolean> {
    try {
      //check if the server requires the first run wizard to be shown, if not, continue to login/signup
      let healthData = await this.fastenService.getHealth().toPromise()

      if (healthData.first_run_wizard) {
        return await this.router.navigate(['/auth/signup/wizard']);
      }

    } catch (e) {
      // if there is an error, just ignore it, and continue to the signin/signup page.
      console.error("ignoring error:", e)
    }
    // continue as normal
    return true
  }
}
