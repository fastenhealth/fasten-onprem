import {Component, OnDestroy, OnInit} from '@angular/core';
import {FastenApiService} from '../../services/fasten-api.service';
import {BackgroundJob} from '../../models/fasten/background-job';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {interval, Observable, Subscription, timer} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
@Component({
  selector: 'app-background-jobs',
  templateUrl: './background-jobs.component.html',
  styleUrls: ['./background-jobs.component.scss']
})
export class BackgroundJobsComponent implements OnInit, OnDestroy {
  backgroundJobsSubscription: Subscription = null
  backgroundJobs: BackgroundJob[] = []
  selectedBackgroundJob: BackgroundJob = null

  constructor(public fastenApi: FastenApiService, private modalService: NgbModal) { }


  ngOnInit(): void {

    //update every minute
    this.backgroundJobsSubscription = timer(0, 60*1000)
      .pipe(
        mergeMap(() => this.fastenApi.getBackgroundJobs())
      )
      .subscribe((jobs) => {
        console.log("Background jobs updated")
        this.backgroundJobs = jobs
      })
  }

  ngOnDestroy() {
    if(this.backgroundJobsSubscription){
      this.backgroundJobsSubscription.unsubscribe()
    }
  }

  openModal(content, backgroundJob: BackgroundJob) {
    this.selectedBackgroundJob = backgroundJob
    this.modalService.open(content, { size: 'lg', scrollable: true });
  }

}
