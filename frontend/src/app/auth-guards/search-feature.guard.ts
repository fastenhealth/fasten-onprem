import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SettingsService } from '../services/settings.service';

@Injectable({
  providedIn: 'root'
})
export class SearchFeatureGuard implements CanActivate {

  constructor(
    private settingsService: SettingsService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const searchEnabled = !!this.settingsService.get('search');

    if (searchEnabled) {
      return true;
    } else {
      // Redirect to a default page if the feature is disabled
      return this.router.parseUrl('/dashboard');
    }
  }
}
