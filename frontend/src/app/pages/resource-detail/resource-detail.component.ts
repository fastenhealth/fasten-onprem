import {Component, OnInit, ViewChild, TemplateRef} from '@angular/core';
import {FastenApiService} from '../../services/fasten-api.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {fhirModelFactory} from '../../../lib/models/factory';
import {ResourceType} from '../../../lib/models/constants';
import {FastenDisplayModel} from '../../../lib/models/fasten/fasten-display-model';
import {Source} from '../../models/fasten/source';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastService} from '../../services/toast.service';
import {ToastNotification, ToastType} from '../../models/fasten/toast';
import {extractErrorFromResponse} from '../../../lib/utils/error_extract';

@Component({
  selector: 'app-resource-detail',
  templateUrl: './resource-detail.component.html',
  styleUrls: ['./resource-detail.component.scss']
})
export class ResourceDetailComponent implements OnInit {
  loading: boolean = false
  debugMode = false;

  sourceId: string = ""
  sourceName: string = ""
  resource: ResourceFhir = null
  displayModel: FastenDisplayModel = null
  source: Source = null
  isManualSource: boolean = false

  constructor(
    private fastenApi: FastenApiService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private toastService: ToastService,
  ) {
  }

  ngOnInit(): void {
    this.loading = true
    this.sourceId = this.route.snapshot.paramMap.get('source_id')

    this.fastenApi.getSource(this.sourceId).subscribe((source) => {
      this.source = source
      this.isManualSource = (source.platform_type === 'manual' || source.platform_type === 'fasten')
    })

    this.fastenApi.getResourceBySourceId(this.sourceId, this.route.snapshot.paramMap.get('resource_id')).subscribe((resourceFhir) => {
      this.loading = false
      this.resource = resourceFhir;
      this.sourceName = "unknown" //TODO popualte this

      try{
        let parsed = fhirModelFactory(resourceFhir.source_resource_type as ResourceType, resourceFhir)
        this.displayModel = parsed
      } catch (e) {
        console.error(e)
      }
    }, error => {
      this.loading = false
    });
  }

  confirmDelete(modal: any) {
    this.modalService.open(modal, {ariaLabelledBy: 'modal-delete-title'}).result.then(
      (result) => {
        if (result === 'delete') {
          this.fastenApi.deleteResourceBySourceId(this.sourceId, this.resource.source_resource_id).subscribe(
            (rowsAffected) => {
              const toastNotification = new ToastNotification()
              toastNotification.type = ToastType.Success
              toastNotification.message = `Successfully deleted resource`
              this.toastService.show(toastNotification)
              this.router.navigate(['/explore', this.sourceId])
            },
            (err) => {
              const toastNotification = new ToastNotification()
              toastNotification.type = ToastType.Error
              toastNotification.message = `An error occurred while deleting resource: ${extractErrorFromResponse(err)}`
              this.toastService.show(toastNotification)
              console.error(err)
            }
          )
        }
      },
      () => { /* modal dismissed */ }
    )
  }
}
