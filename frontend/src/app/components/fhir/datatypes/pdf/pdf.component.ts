import {Component, Input, OnInit} from '@angular/core';
import {BinaryModel} from '../../../../../lib/models/resources/binary-model';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

@Component({
  selector: 'fhir-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.scss']
})
export class PdfComponent implements OnInit {
  @Input() displayModel: BinaryModel

  height: number
  constructor(private sanitized: DomSanitizer) { }

  safeUrl: SafeUrl

  ngOnInit(): void {
    const maxHeight = 600;
    if (this.displayModel){

      const contentHeight = (1111 * this.displayModel?.data.length) / (24996 / 7.5);

      this.safeUrl = this.sanitized.bypassSecurityTrustResourceUrl(`data:${this.displayModel?.content_type};base64,${this.displayModel?.data}`);
      this.height = Math.min(maxHeight, contentHeight);
    } else {
      this.safeUrl = this.sanitized.bypassSecurityTrustResourceUrl('')
    }
  }

}
