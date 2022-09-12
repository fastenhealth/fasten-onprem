import { Component, OnInit } from '@angular/core';
import {User} from '../../models/fasten/user';
import {FastenApiService} from '../../services/fasten-api.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-auth-signin',
  templateUrl: './auth-signin.component.html',
  styleUrls: ['./auth-signin.component.scss']
})
export class AuthSigninComponent implements OnInit {
  submitted: boolean = false
  existingUser: User = new User()

  constructor(private fastenApi: FastenApiService,  private router: Router) { }

  ngOnInit(): void {
  }

  signinSubmit(){
    this.submitted = true;

    this.fastenApi.signin(this.existingUser.username, this.existingUser.password).subscribe((tokenResp: any) => {
      console.log(tokenResp);

      this.router.navigateByUrl('/dashboard');
    })
  }
}
