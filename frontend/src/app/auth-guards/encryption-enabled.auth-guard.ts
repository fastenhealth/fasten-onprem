import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import {FastenDbService} from '../services/fasten-db.service';

@Injectable()
export class EncryptionEnabledAuthGuard implements CanActivate {
  constructor(private fastenDbService: FastenDbService, private router: Router) {

  }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise <boolean> {
    //check if the user has encryption data stored in this browser already
    if (!await this.fastenDbService.isCryptConfigAvailable()) {
      return await this.router.navigate(['/account/security/manager']);
    }
    // continue as normal
    return true
  }
}
