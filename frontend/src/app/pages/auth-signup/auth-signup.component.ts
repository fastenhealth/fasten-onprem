import { Component, OnInit } from '@angular/core';
import {FastenDbService} from '../../services/fasten-db.service';
import {User} from '../../../lib/models/fasten/user';
import {Router} from '@angular/router';

@Component({
  selector: 'app-auth-signup',
  templateUrl: './auth-signup.component.html',
  styleUrls: ['./auth-signup.component.scss']
})
export class AuthSignupComponent implements OnInit {
  submitted: boolean = false
  newUser: User = new User()
  errorMsg: string = ""

  constructor(
    // private fastenApi: FastenApiService,
    private fastenDb: FastenDbService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  signupSubmit(){
    this.submitted = true;

    this.fastenDb.Signup(this.newUser).then((tokenResp: any) => {
        console.log(tokenResp);
        this.router.navigateByUrl('/dashboard');
      },
      (err)=>{
        console.error("an error occured while signup",err)
        if(err.name === 'conflict') {
          // "batman" already exists, choose another username
          this.errorMsg = "username already exists"
        } else if (err.name === 'forbidden') {
          // invalid username
          this.errorMsg = "invalid username"
        } else {
          this.errorMsg = "an unknown error occurred during sign-up"
        }
    })
  }

}
