import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {BinaryModel} from '../../../../../lib/models/resources/binary-model';
import {FhirCardComponentInterface} from '../../fhir-card/fhir-card-component-interface';
import {Router, RouterModule} from '@angular/router';
import {AttachmentModel} from '../../../../../lib/models/datatypes/attachment-model';
import {FastenApiService} from '../../../../services/fasten-api.service';
import {NgbCollapseModule} from "@ng-bootstrap/ng-bootstrap";
import {CommonModule} from "@angular/common";
import {BadgeComponent} from "../../common/badge/badge.component";
import {TableComponent} from "../../common/table/table.component";
import {PdfComponent} from "../../datatypes/pdf/pdf.component";
import {ImgComponent} from "../../datatypes/img/img.component";
import {HtmlComponent} from "../../datatypes/html/html.component";
import {MarkdownComponent} from "../../datatypes/markdown/markdown.component";
import {BinaryTextComponent} from "../../datatypes/binary-text/binary-text.component";
import {DicomComponent} from "../../datatypes/dicom/dicom.component";
import {HighlightModule} from "ngx-highlightjs";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {AuthService} from "../../../../services/auth.service";
import {RtfComponent} from '../../datatypes/rtf/rtf.component';

@Component({
  standalone: true,
  imports: [
    NgbCollapseModule,
    CommonModule,
    PdfComponent,
    ImgComponent,
    HtmlComponent,
    MarkdownComponent,
    RtfComponent,
    BinaryTextComponent,
    DicomComponent,
    HighlightModule,
    RouterModule
  ],
  providers: [FastenApiService, AuthService],
  selector: 'fhir-binary',
  templateUrl: './binary.component.html',
  styleUrls: ['./binary.component.scss']
})
export class BinaryComponent implements OnInit, FhirCardComponentInterface {
  @Input() displayModel: BinaryModel
  @Input() showDetails: boolean = true
  @Input() attachmentSourceId: string
  @Input() attachmentModel: AttachmentModel //can only have attachmentModel or binaryModel, not both.
  @Input() isCollapsed: boolean = false

  loading: boolean = false
  constructor(public changeRef: ChangeDetectorRef, public router: Router, public fastenApi: FastenApiService) {}

  ngOnInit(): void {
    if(!this.displayModel && this.attachmentSourceId && this.attachmentModel){
      this.loading = true
      this.fastenApi.getBinaryModel(this.attachmentSourceId, this.attachmentModel)
        .subscribe((binaryModel: BinaryModel) => {
          this.loading = false
          this.displayModel = binaryModel
          this.markForCheck()
        }, (error) => {
          this.loading = false
          console.error("Failed to lookup binary resource from attachment:", error)
          this.markForCheck()
        })
    }
  }
  markForCheck(){
    this.changeRef.markForCheck()
  }
}
