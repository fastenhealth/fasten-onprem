import {Component, Input, OnInit} from '@angular/core';
import {
  LighthouseSourceSearchAggregation,
} from '../../models/lighthouse/lighthouse-source-search';
import {MedicalSourcesFilterService} from '../../services/medical-sources-filter.service';

@Component({
  selector: 'app-medical-sources-filter',
  templateUrl: './medical-sources-filter.component.html',
  styleUrls: ['./medical-sources-filter.component.scss']
})
export class MedicalSourcesFilterComponent implements OnInit {

  @Input() categories: LighthouseSourceSearchAggregation = {buckets: [], sum_other_doc_count: 0}
  @Input() platformTypes: LighthouseSourceSearchAggregation = {buckets: [], sum_other_doc_count: 0}

  constructor(
    public filterService: MedicalSourcesFilterService,
  ) { }

  ngOnInit(): void {

  }

  categorySelected(category: string){
    this.filterService.filterForm.patchValue({'categories': {[category]: true}})
  }
  platformTypeSelected(platformType: string){
    this.filterService.filterForm.patchValue({'platformTypes': {[platformType]: true}})
  }

  bucketDocCount(aggregationData: LighthouseSourceSearchAggregation, key): number {
    return aggregationData?.buckets?.find(bucket => bucket.key === key)?.doc_count
  }

}
