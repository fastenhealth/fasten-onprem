import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Source} from '../../models/fasten/source';
import {FastenApiService} from '../../services/fasten-api.service';

@Component({
  selector: 'app-source-detail',
  templateUrl: './source-detail.component.html',
  styleUrls: ['./source-detail.component.scss']
})
export class SourceDetailComponent implements OnInit {

  selectedSource: Source = null

  constructor(private fastenApi: FastenApiService, private router: Router, private route: ActivatedRoute) {
    //check if the current Source was sent over using the router state storage:
    if(this.router.getCurrentNavigation().extras.state){
      this.selectedSource = this.router.getCurrentNavigation().extras.state as Source
    }
  }

  ngOnInit(): void {
     if(this.selectedSource == null) {
      //lookup the source by ID.
      this.fastenApi.getSource(this.route.snapshot.paramMap.get('source_id')).subscribe((source) => {
        this.selectedSource = source
      })
    }
  }

}
