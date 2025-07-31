import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class IsAdminAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    if (await this.authService.IsAuthenticated() && await this.authService.IsAdmin()) {
      return true;
    }
    this.router.navigate(['/dashboard']);
    return false;
  }
}
