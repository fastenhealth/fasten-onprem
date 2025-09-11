import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {AuthService} from '../services/auth.service';

@Injectable()
export class IsAuthenticatedAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {

  }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise <boolean> {
    //check if the user is authenticated, if not, redirect to login
    if (! await this.authService.IsAuthenticated()) {
      return await this.router.navigate(['/auth/signin']);
    }
    // continue as normal
    return true
  }
}
