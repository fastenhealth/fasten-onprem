import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SourceListItem} from '../../pages/medical-sources/medical-sources.component';

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

}
