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

  @ViewChild(GridstackComponent) gridComp?: GridstackComponent;

  constructor(
    private lighthouseApi: LighthouseService,
    private fastenApi: FastenApiService,
    private router: Router,
    private componentFactoryResolver: ComponentFactoryResolver,
    private vcRef: ViewContainerRef,
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
      this.dashboardConfigs?.[0].widgets.forEach((widgetConfig) => {
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

  public toggleEditableGrid() {
    this.gridEditDisabled = !this.gridEditDisabled;
    console.log('toggle - is disabled', this.gridEditDisabled)

    this.gridEditDisabled ? this.gridComp.grid?.disable(true) : this.gridComp.grid?.enable(true);

  }
}
