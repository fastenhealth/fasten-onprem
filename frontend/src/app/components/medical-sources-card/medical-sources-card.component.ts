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
    if(sourceItem.metadata?.display) {
      return sourceItem.metadata?.display
    }
    if(sourceItem.source?.source_type == 'manual') {
      return 'Uploaded ' + moment(sourceItem.source?.created_at).format('MMM DD, YYYY')
    }
    return "Unknown"
  }

}
