import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EnvironmentService } from '../services/environment.service';

@Injectable({
  providedIn: 'root'
})
export class ChatFeatureGuard implements CanActivate {

  constructor(
    private environmentService: EnvironmentService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const chatEnabled = !!this.environmentService.get('typesense')?.chat;

    if (chatEnabled) {
      return true;
    } else {
      // Redirect to a default page if the feature is disabled
      return this.router.parseUrl('/dashboard');
    }
  }
}
