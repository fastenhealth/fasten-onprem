import { Component, OnInit } from '@angular/core';
import {User} from '../../models/fasten/user';
import {Router} from '@angular/router';
import {ToastNotification, ToastType} from '../../models/fasten/toast';
import {ToastService} from '../../services/toast.service';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-auth-signup',
  templateUrl: './auth-signup.component.html',
  styleUrls: ['./auth-signup.component.scss']
})
export class AuthSignupComponent implements OnInit {
  loading: boolean = false

  submitted: boolean = false
  newUser: User = new User()
  errorMsg: string = ""

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
  }

  signupSubmit(){
    this.loading = true
    this.submitted = true;

    this.authService.Signup(this.newUser).then((tokenResp: any) => {
        this.loading = false
        this.router.navigateByUrl('/dashboard');
      },
      (err)=>{
        this.loading = false
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

        const toastNotificaiton = new ToastNotification()
        toastNotificaiton.type = ToastType.Error
        toastNotificaiton.message = this.errorMsg
        this.toastService.show(toastNotificaiton)
    })
  }

}
