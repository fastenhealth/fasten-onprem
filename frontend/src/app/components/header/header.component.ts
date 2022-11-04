import { Component, OnInit } from '@angular/core';
import {FastenDbService} from '../../services/fasten-db.service';
import { Router } from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {UserRegisteredClaims} from '../../models/fasten/user-registered-claims';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  current_user_claims: UserRegisteredClaims
  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    try {
      this.current_user_claims = this.authService.GetCurrentUser()
    } catch(e){
      this.current_user_claims = new UserRegisteredClaims()
    }

  }

  closeMenu(e) {
    e.target.closest('.dropdown').classList.remove('show');
    e.target.closest('.dropdown .dropdown-menu').classList.remove('show');
  }

  toggleHeaderMenu(event) {
    event.preventDefault();
    document.querySelector('body').classList.toggle('az-header-menu-show');
  }

  signOut(e) {
    this.authService.Logout()
      .then(() => this.router.navigate(['auth/signin']))
  }
}
