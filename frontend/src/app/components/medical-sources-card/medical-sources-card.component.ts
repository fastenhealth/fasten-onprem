import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SourceListItem} from '../../pages/medical-sources/medical-sources.component';
import moment from 'moment/moment';

@Component({
  selector: 'app-medical-sources-card',
  templateUrl: './medical-sources-card.component.html',
  styleUrls: ['./medical-sources-card.component.scss']
})
export class MedicalSourcesCardComponent implements OnInit {

  @Input() sourceInfo: SourceListItem;
  @Input() status: undefined | "token" | "authorize" | "failed";

  @Output() onClick = new EventEmitter<SourceListItem>()

  constructor() { }

  ngOnInit(): void {
  }

  onCardClick(){
    this.onClick.emit(this.sourceInfo)
  }

  getSourceDisplayName(sourceItem: SourceListItem): string {
    if(!sourceItem) return "Unknown"
    if(sourceItem.source?.display) {
      return sourceItem.source?.display
    }
    if(sourceItem.source?.platform_type == 'manual') {
      return 'Uploaded ' + moment(sourceItem.source?.created_at).format('MMM DD, YYYY')
    } else if(sourceItem.source?.platform_type == 'fasten'){
      return 'Fasten Health'
    }
    if(sourceItem.brand?.name) {
      return sourceItem.brand?.name
    }
    return "Unknown"
  }

}
