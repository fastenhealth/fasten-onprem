import {Component, Input, OnInit} from '@angular/core';
import {Source} from '../../models/fasten/source';
import {SourceListItem} from '../../pages/medical-sources/medical-sources.component';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FastenApiService} from '../../services/fasten-api.service';
import {forkJoin} from 'rxjs';
import {LighthouseService} from '../../services/lighthouse.service';

@Component({
  selector: 'app-medical-sources-connected',
  templateUrl: './medical-sources-connected.component.html',
  styleUrls: ['./medical-sources-connected.component.scss']
})
export class MedicalSourcesConnectedComponent implements OnInit {
  loading: boolean = false
  status: { [name: string]:  undefined | "token" | "authorize" } = {}

  modalSelectedSourceListItem:SourceListItem = null;
  modalCloseResult = '';

  connectedSourceList: SourceListItem[] = [] //source's are populated for this list

  constructor(
    private lighthouseApi: LighthouseService,
    private fastenApi: FastenApiService,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.loading = true
    this.fastenApi.getSources().subscribe(results => {
      this.loading = false

      //handle connected sources sources
      const connectedSources = results as Source[]
      forkJoin(connectedSources.map((source) => this.lighthouseApi.getLighthouseSource(source.source_type))).subscribe((connectedMetadata) => {
        for(const ndx in connectedSources){
          this.connectedSourceList.push({source: connectedSources[ndx], metadata: connectedMetadata[ndx]})
        }
      })
    })
  }


  public openModal(contentModalRef, sourceListItem: SourceListItem) {
    if(this.status[sourceListItem.metadata.source_type] || !sourceListItem.source){
      //if this source is currently "loading" dont open the modal window
      return
    }

    this.modalSelectedSourceListItem = sourceListItem
    this.modalService.open(contentModalRef, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.modalSelectedSourceListItem = null
      this.modalCloseResult = `Closed with: ${result}`;
    }, (reason) => {
      this.modalSelectedSourceListItem = null
      this.modalCloseResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }



  public sourceSyncHandler(source: Source){
    this.status[source.source_type] = "authorize"
    this.modalService.dismissAll()

    this.fastenApi.syncSource(source.id).subscribe(
      (respData) => {
        delete this.status[source.source_type]
        console.log("source sync response:", respData)
      },
      (err) => {
        delete this.status[source.source_type]
        console.log(err)
      }
    )
  }


  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
