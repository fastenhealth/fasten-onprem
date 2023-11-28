import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {BinaryModel} from '../../../../../lib/models/resources/binary-model';
import {Router} from '@angular/router';
import {FhirCardComponentInterface} from '../../fhir-card/fhir-card-component-interface';
import {NgbCollapseModule} from '@ng-bootstrap/ng-bootstrap';
import {CommonModule} from '@angular/common';
import {HighlightModule} from 'ngx-highlightjs';

@Component({
  standalone: true,
  imports: [NgbCollapseModule, HighlightModule, CommonModule],
  selector: 'fhir-fallback',
  templateUrl: './fallback.component.html',
  styleUrls: ['./fallback.component.scss']
})
export class FallbackComponent implements OnInit, FhirCardComponentInterface {
  @Input() displayModel: BinaryModel
  @Input() showDetails: boolean = true
  @Input() isCollapsed: boolean = false

  constructor(public changeRef: ChangeDetectorRef, public router: Router) {}

  ngOnInit(): void {
  }
  markForCheck(){
    this.changeRef.markForCheck()
  }

}
