import {Component, OnInit} from '@angular/core';
import {User} from '../../models/fasten/user';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService} from '../../services/toast.service';
import {ToastNotification, ToastType} from '../../models/fasten/toast';
import {environment} from '../../../environments/environment';
import {AuthService} from '../../services/auth.service';
import {Location} from '@angular/common';

@Component({
  selector: 'app-auth-signin',
  templateUrl: './auth-signin.component.html',
  styleUrls: ['./auth-signin.component.scss']
})
export class AuthSigninComponent implements OnInit {
  loading: boolean = false

  submitted: boolean = false
  existingUser: User = new User()
  errorMsg: string = ""
  showExternalIdP: boolean = environment.environment_cloud

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private toastService: ToastService,
  ) { }

  ngOnInit(): void {

    let idpType = this.route.snapshot.paramMap.get('idp_type')
    if(idpType){
      this.loading = true
      let params = new URLSearchParams(window.location.hash.substring(1))
      let code = params.get('code') // eyJhbGciOiJSUzI1...rest_of_ID_Token
      let state = params.get('state') // eyJhbGciOiJSUzI1...rest_of_ID_Token

      this.resetUrlOnCallback()
      this.authService.IdpCallback(idpType, state, code)
        .then(() => {
          //for cloud users ONLY, skip the encryption manager.
          //TODO: replace Pouchdb.
          let userId = this.authService.GetCurrentUser().sub
          //TODO: static IV, must be removed/replaced.
          return {username: userId, key: userId}
        })
        .then(() => this.router.navigateByUrl('/dashboard'))
        .catch((err)=>{
          console.error("idpCallback error:", err)
          const toastNotification = new ToastNotification()
          toastNotification.type = ToastType.Error
          toastNotification.message = "an error occurred while signing in"
          this.toastService.show(toastNotification)
        })
    }

  }

  signinSubmit(){
    this.submitted = true;
    this.loading = true

    this.authService.Signin(this.existingUser.username, this.existingUser.password)
      .then(() => {
        this.loading = false
        this.router.navigateByUrl('/dashboard')
      })
      .catch((err)=>{
        this.loading = false
        if(err?.name){
          this.errorMsg = "username or password is incorrect"
        } else{
          this.errorMsg = "an unknown error occurred during sign-in"
        }
        const toastNotification = new ToastNotification()
        toastNotification.type = ToastType.Error
        toastNotification.message = this.errorMsg
        this.toastService.show(toastNotification)
      })
  }

  resetUrlOnCallback(){
    //reset the url, removing the params and fragment from the current url.
    const urlTree = this.router.createUrlTree(["/auth/signin"],{
      relativeTo: this.route,
    });
    this.location.replaceState(urlTree.toString());
  }

  idpConnectHello($event){
    this.authService.IdpConnect('hello').catch(console.error)
  }
}
