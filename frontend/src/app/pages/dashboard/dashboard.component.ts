import { Component, ComponentFactoryResolver, EmbeddedViewRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import {Source} from '../../models/fasten/source';
import {Router} from '@angular/router';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {forkJoin} from 'rxjs';
import {FastenApiService} from '../../services/fasten-api.service';
import {LighthouseService} from '../../services/lighthouse.service';
import { GridStack, GridStackOptions, GridStackWidget } from 'gridstack';
import {GridstackComponent, NgGridStackOptions} from '../../components/gridstack/gridstack.component';
import {DashboardConfig} from '../../models/widget/dashboard-config';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Summary} from '../../models/fasten/summary';
import { SettingsService } from 'src/app/services/settings.service';

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

  searchEnabled: boolean = false

  lastUpdated: Date = null

  sources: Source[] = []
  encounterCount: number = 0
  recordsCount: number = 0
  patientForSource: {[name: string]: ResourceFhir} = {}

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
    private settingsService: SettingsService,
  ) { }

  ngOnInit() {
    this.searchEnabled = !!this.settingsService.get('search');
    this.loading = true

    this.fastenApi.getSummary().subscribe((summary: Summary) => {
      if (summary.sources && summary.sources.length > 0) {
        this.lastUpdated = summary.sources.reduce((latest, source) => {
          const sourceDate = new Date(source.updated_at);
          return sourceDate > latest ? sourceDate : latest;
        }, new Date(0));
      }
    })


    forkJoin([
      this.fastenApi.getDashboards(),
    ]).subscribe(results => {
      this.loading = false
      this.dashboardConfigs = results[0] as DashboardConfig[]


      //setup dashboard configs
      this.changeSelectedDashboard(0)

    }, error => {
      this.loading = false
    });


  }

  selectSource(selectedSource: Source){
    this.router.navigate(['/explore', selectedSource.id], {
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
    if(source.platform_type == "manual" || source.platform_type == 'fasten'){
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

    this.gridEditDisabled ? this.gridComp.grid?.disable(true) : this.gridComp.grid?.enable(true);

  }

  public addDashboardLocation(){
    this.addDashboardLoading = true
    this.dashboardLocationError = ''
    this.fastenApi.addDashboardLocation(this.dashboardLocation).subscribe((result) => {
      this.addDashboardLoading = false

      this.modalService.dismissAll()

      //reload the page
      window.location.reload()
    }, (error) => {
      this.addDashboardLoading = false
      this.dashboardLocationError = error

      },
    () => {
      this.addDashboardLoading = false
    })
  }

  public showAddDashboardLocationModal(content) {
    this.dashboardLocation = ''
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.catch(console.error);
  }
  public showDashboardSettingsModal(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.catch(console.error);
  }

}
