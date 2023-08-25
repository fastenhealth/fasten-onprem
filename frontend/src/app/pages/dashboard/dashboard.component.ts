import { Component, ComponentFactoryResolver, EmbeddedViewRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import {Source} from '../../models/fasten/source';
import {Router} from '@angular/router';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {forkJoin} from 'rxjs';
import {MetadataSource} from '../../models/fasten/metadata-source';
import {FastenApiService} from '../../services/fasten-api.service';
import {LighthouseService} from '../../services/lighthouse.service';
import { GridStack, GridStackOptions, GridStackWidget } from 'gridstack';
import {GridstackComponent, NgGridStackOptions} from '../../components/gridstack/gridstack.component';
import {DashboardConfig} from '../../models/widget/dashboard-config';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';


// unique ids sets for each item for correct ngFor updating
//TODO: fix this
let ids = 1;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading: boolean = false

  sources: Source[] = []
  encounterCount: number = 0
  recordsCount: number = 0
  patientForSource: {[name: string]: ResourceFhir} = {}

  metadataSource: { [name: string]: MetadataSource }
  dashboardConfigs: DashboardConfig[] = []
  selectedDashboardConfigNdx: number = 0

  //dashboardLocation is used to store the location of the dashboard that we're trying to add
  addDashboardLoading: boolean = false
  dashboardLocation: string = ''
  dashboardLocationError: string = ''

  @ViewChild(GridstackComponent) gridComp?: GridstackComponent;

  constructor(
    private lighthouseApi: LighthouseService,
    private fastenApi: FastenApiService,
    private router: Router,
    private componentFactoryResolver: ComponentFactoryResolver,
    private vcRef: ViewContainerRef,
    private modalService: NgbModal,
  ) { }

  ngOnInit() {
    this.loading = true


    forkJoin([
      this.fastenApi.getDashboards(),
    ]).subscribe(results => {
      this.loading = false
      this.dashboardConfigs = results[0] as DashboardConfig[]


      //setup dashboard configs
      console.log("DASHBOARDS!", this.dashboardConfigs)
      this.changeSelectedDashboard(0)

    }, error => {
      this.loading = false
    });


  }

  selectSource(selectedSource: Source){
    this.router.navigateByUrl(`/explore/${selectedSource.id}`, {
      state: selectedSource
    });
  }

  getPatientSummary(patient: any) {
    if(patient && patient.name && patient.name[0]){
      return `${patient.name[0].family}, ${patient.name[0].given.join(' ')}`
    }
    return ''
  }

  isActive(source: Source){
    if(source.source_type == "manual"){
      return '--'
    }
    let expiresDate = new Date(source.expires_at);
    let currentDate = new Date()
    return expiresDate < currentDate ? 'active' : 'expired'
  }


  //  GridStack options and configuration for tesitng.

  public gridEditDisabled = true;


  public gridOptions: NgGridStackOptions = {
    margin: 5,
    float: false,
    minRow: 1,
    acceptWidgets: false,
    alwaysShowResizeHandle: true,

    //these 2 options can be used to enable/disable editability
    // disableDrag: true,
    // disableResize: true
    children: [],
  }

  public changeSelectedDashboard(selectedDashboardNdx: number){
    this.selectedDashboardConfigNdx = selectedDashboardNdx
    this.gridComp?.grid?.removeAll() //clear the grid

    this.dashboardConfigs?.[this.selectedDashboardConfigNdx]?.widgets?.forEach((widgetConfig) => {
      console.log("Adding Widgets to Dashboard Grid")

      this.gridComp?.grid?.addWidget({
        x: widgetConfig.x,
        y: widgetConfig.y,
        w: widgetConfig.width,
        h: widgetConfig.height,
        // @ts-ignore
        type: widgetConfig.item_type,
        widgetConfig: !!widgetConfig?.queries?.length ? widgetConfig : undefined,
      })
    })
  }

  public toggleEditableGrid() {
    this.gridEditDisabled = !this.gridEditDisabled;
    console.log('toggle - is disabled', this.gridEditDisabled)

    this.gridEditDisabled ? this.gridComp.grid?.disable(true) : this.gridComp.grid?.enable(true);

  }

  public addDashboardLocation(){
    this.addDashboardLoading = true
    this.dashboardLocationError = ''
    this.fastenApi.addDashboardLocation(this.dashboardLocation).subscribe((result) => {
      console.log("Added Remote Dashboard", result)
      this.addDashboardLoading = false

      this.modalService.dismissAll()

      //reload the page
      window.location.reload()
    }, (error) => {
      console.log("Error Adding Remote Dashboard", error)
      this.addDashboardLoading = false
      this.dashboardLocationError = error

      },
    () => {
      console.log("Completed Adding Remote Dashboard")
      this.addDashboardLoading = false
    })
  }

  public showAddDashboardLocationModal(content) {
    this.dashboardLocation = ''
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => {
        console.log(`Closed with: ${result}`)
      },
      (reason) => {
        console.log(`Dismissed ${reason}`)
      },
    );
  }
  public showDashboardSettingsModal(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => {
        console.log(`Closed with: ${result}`)
      },
      (reason) => {
        console.log(`Dismissed ${reason}`)
      },
    );
  }

}
