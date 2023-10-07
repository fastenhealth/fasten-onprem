import { Component, OnInit } from '@angular/core';
import {FastenApiService} from '../../services/fasten-api.service';
import {BackgroundJob} from '../../models/fasten/background-job';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-background-jobs',
  templateUrl: './background-jobs.component.html',
  styleUrls: ['./background-jobs.component.scss']
})
export class BackgroundJobsComponent implements OnInit {
  backgroundJobs: BackgroundJob[] = []
  selectedBackgroundJob: BackgroundJob = null

  constructor(public fastenApi: FastenApiService, private modalService: NgbModal) { }


  ngOnInit(): void {
    this.fastenApi.getBackgroundJobs().subscribe((jobs) => {
      this.backgroundJobs = jobs
    })
  }

  openModal(content, backgroundJob: BackgroundJob) {
    this.selectedBackgroundJob = backgroundJob
    this.modalService.open(content, { size: 'lg' });
  }

}
