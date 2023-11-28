import {Component, Input, OnInit} from '@angular/core';
import {BinaryModel} from '../../../../../lib/models/resources/binary-model';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {CommonModule} from "@angular/common";

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'fhir-html',
  templateUrl: './html.component.html',
  styleUrls: ['./html.component.scss']
})
export class HtmlComponent implements OnInit {
  @Input() displayModel: BinaryModel
  contentMarkup:SafeHtml;
  constructor(private sanitized: DomSanitizer) { }

  ngOnInit(): void {
    //TODO: safely display html content
    this.contentMarkup = this.sanitized.bypassSecurityTrustHtml(this.displayModel?.content);

  }

}
