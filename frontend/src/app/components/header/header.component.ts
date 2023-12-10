import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationStart, Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {UserRegisteredClaims} from '../../models/fasten/user-registered-claims';
import {FastenApiService} from '../../services/fasten-api.service';
import {BackgroundJob} from '../../models/fasten/background-job';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {SupportRequest} from '../../models/fasten/support-request';
import {environment} from '../../../environments/environment';
import {versionInfo} from '../../../environments/versions';
import {Subscription} from 'rxjs';
import {ToastNotification, ToastType} from '../../models/fasten/toast';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  current_user_claims: UserRegisteredClaims
  backgroundJobs: BackgroundJob[] = []

  newSupportRequest: SupportRequest = null
  loading: boolean = false
  errorMsg: string = ""
  submitSuccess: boolean = false

  routerSubscription: Subscription = null

  is_environment_desktop: boolean = environment.environment_desktop

  constructor(
    private authService: AuthService,
    private router: Router,
    private fastenApi: FastenApiService,
    private modalService: NgbModal) { }

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

    this.resetSupportRequestForm()
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.newSupportRequest.current_page = event.url.toString()
      }
    })
  }

  ngOnDestroy() {
    if(this.routerSubscription){
      this.routerSubscription.unsubscribe()
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

  //support Form

  openSupportForm(content) {
    this.modalService.open(content, { size: 'lg' });
  }

  resetSupportRequestForm() {
    this.submitSuccess = false
    let newSupportRequest = new SupportRequest()
    newSupportRequest.dist_type = environment.environment_desktop ? 'desktop' : 'docker'
    newSupportRequest.flavor = environment.environment_name
    newSupportRequest.version = versionInfo.version
    newSupportRequest.current_page = this.router.url.toString()

    this.newSupportRequest = newSupportRequest
  }
  submitSupportForm() {
    console.log("submitting support form", this.newSupportRequest)
    this.loading = false

    this.fastenApi.supportRequest(this.newSupportRequest).subscribe((resp: any) => {
        this.loading = false
        console.log(resp);
        this.submitSuccess = true
        //show success toast? close modal?
      },
      (err)=>{
        this.loading = false
        console.error("an error occurred during support request submission",err)
        this.errorMsg = err || "An error occurred while submitting your support request. Please try again later."
      })
  }


}
