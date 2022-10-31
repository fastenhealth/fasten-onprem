import {Component, OnInit} from '@angular/core';
import {User} from '../../../lib/models/fasten/user';
import {FastenDbService} from '../../services/fasten-db.service';
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
  submitted: boolean = false
  existingUser: User = new User()
  errorMsg: string = ""
  showExternalIdP: boolean = environment.is_cloud

  constructor(
    private fastenDb: FastenDbService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private toastService: ToastService,
  ) { }

  ngOnInit(): void {

    const idpType = this.route.snapshot.paramMap.get('idp_type')
    if(idpType){
      const params = new URLSearchParams(window.location.hash.substring(1))
      const code = params.get('code') // eyJhbGciOiJSUzI1...rest_of_ID_Token
      this.resetUrlOnCallback()
      this.authService.IdpCallback(idpType, code).then(console.log)
    }

  }

  signinSubmit(){
    this.submitted = true;

    this.fastenDb.Signin(this.existingUser.username, this.existingUser.password)
      .then(() => this.router.navigateByUrl('/dashboard'))
      .catch((err)=>{
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

    this.authService.IdpConnect('hello')
      .then(console.log)
  }
}
