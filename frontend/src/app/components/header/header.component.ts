import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {UserRegisteredClaims} from '../../models/fasten/user-registered-claims';
import {FastenApiService} from '../../services/fasten-api.service';
import {BackgroundJob} from '../../models/fasten/background-job';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  current_user_claims: UserRegisteredClaims
  backgroundJobs: BackgroundJob[] = []
  constructor(private authService: AuthService, private router: Router, private fastenApi: FastenApiService) { }

  ngOnInit() {
    try {
      this.current_user_claims = this.authService.GetCurrentUser()
    } catch(e){
      this.current_user_claims = new UserRegisteredClaims()
    }

    this.fastenApi.getBackgroundJobs().subscribe((data) => {
      this.backgroundJobs = data.filter((job) => {
        return job.data?.checkpoint_data?.summary?.UpdatedResources?.length > 0
      })
    })
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
