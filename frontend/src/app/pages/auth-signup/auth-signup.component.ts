import { Component, OnInit } from '@angular/core';
import {FastenApiService} from '../../services/fasten-api.service';
import {ProviderConfig} from '../../models/passport/provider-config';
import {User} from '../../models/fasten/user';
import {Router} from '@angular/router';

@Component({
  selector: 'app-auth-signup',
  templateUrl: './auth-signup.component.html',
  styleUrls: ['./auth-signup.component.scss']
})
export class AuthSignupComponent implements OnInit {
  submitted: boolean = false
  newUser: User = new User()

  constructor(private fastenApi: FastenApiService, private router: Router) { }

  ngOnInit(): void {
  }

  signupSubmit(){
    this.submitted = true;

    this.fastenApi.signup(this.newUser).subscribe((tokenResp: any) => {
        console.log(tokenResp);

        this.router.navigateByUrl('/dashboard');
      })

  }

}
