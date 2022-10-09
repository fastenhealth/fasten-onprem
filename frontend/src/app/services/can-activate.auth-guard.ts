import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import { FastenDbService } from './fasten-db.service';

@Injectable()
export class CanActivateAuthGuard implements CanActivate {
  constructor(private fastenDbService: FastenDbService, private router: Router) {

  }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise <boolean> {
    //check if the user is authenticated, if not, redirect to login
    if (! await this.fastenDbService.IsAuthenticated()) {
      this.router.navigate(['/auth/signin']);
    }
    // continue as normal
    return true
  }
}
