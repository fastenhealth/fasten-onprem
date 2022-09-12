import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import { FastenApiService } from './fasten-api.service';

@Injectable()
export class CanActivateAuthGuard implements CanActivate {
  constructor(private fastenApiService: FastenApiService, private router: Router) {

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    //check if the user is authenticated, if not, redirect to login
    if (!this.fastenApiService.isAuthenticated()) {
      this.router.navigate(['/auth/signin']);
    }
    // continue as normal
    return true
  }
}
