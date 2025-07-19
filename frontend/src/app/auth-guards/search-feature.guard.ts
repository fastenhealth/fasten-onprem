import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EnvironmentService } from '../services/environment.service';

@Injectable({
  providedIn: 'root'
})
export class SearchFeatureGuard implements CanActivate {

  constructor(
    private environmentService: EnvironmentService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const searchEnabled = !!this.environmentService.get('typesense')?.search;

    if (searchEnabled) {
      return true;
    } else {
      // Redirect to a default page if the feature is disabled
      return this.router.parseUrl('/dashboard');
    }
  }
}
