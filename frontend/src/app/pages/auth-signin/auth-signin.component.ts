import {Component, OnInit} from '@angular/core';
import {User} from '../../../lib/models/fasten/user';
import {FastenDbService} from '../../services/fasten-db.service';
import {Router} from '@angular/router';
import {ToastService} from '../../services/toast.service';
import {ToastNotification, ToastType} from '../../models/fasten/toast';

@Component({
  selector: 'app-auth-signin',
  templateUrl: './auth-signin.component.html',
  styleUrls: ['./auth-signin.component.scss']
})
export class AuthSigninComponent implements OnInit {
  submitted: boolean = false
  existingUser: User = new User()
  errorMsg: string = ""

  constructor(private fastenDb: FastenDbService,  private router: Router, private toastService: ToastService) { }

  ngOnInit(): void {
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
        const toastNotificaiton = new ToastNotification()
        toastNotificaiton.type = ToastType.Error
        toastNotificaiton.message = this.errorMsg
        this.toastService.show(toastNotificaiton)
      })

  }
}
