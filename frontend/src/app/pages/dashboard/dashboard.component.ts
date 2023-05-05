import { Component, ComponentFactoryResolver, EmbeddedViewRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import {Source} from '../../models/fasten/source';
import {Router} from '@angular/router';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import {forkJoin} from 'rxjs';
import {MetadataSource} from '../../models/fasten/metadata-source';
import {FastenApiService} from '../../services/fasten-api.service';
import {Summary} from '../../models/fasten/summary';
import {LighthouseService} from '../../services/lighthouse.service';
import { GridStack, GridStackOptions, GridStackWidget } from 'gridstack';
import { GridstackComponent } from '../../components/gridstack/gridstack.component';
import {DashboardWidgetComponent} from '../../widgets/dashboard-widget/dashboard-widget.component';
import {DashboardWidgetConfig} from '../../models/widget/dashboard-widget-config';


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

    forkJoin([this.fastenApi.getSummary(), this.lighthouseApi.getLighthouseSourceMetadataMap(false)]).subscribe(results => {
      this.loading = false
      let summary = results[0] as Summary
      let metadataSource = results[1] as { [name: string]: MetadataSource }

      //process
      console.log("SUMMARY RESPONSE",summary);
      this.sources = summary.sources
      this.metadataSource = metadataSource
      this.metadataSource["manual"] = {
        "source_type": "manual",
        "platform_type": "manual",
        "display": "Manual",
        "category": ["Manual"],
        "hidden": false,
      }

      //calculate the number of records
      summary.resource_type_counts.forEach((resourceTypeInfo) => {
        this.recordsCount += resourceTypeInfo.count
        if(resourceTypeInfo.resource_type == "Encounter"){
          this.encounterCount = resourceTypeInfo.count
        }
      })

      summary.patients.forEach((resourceFhir) => {
        this.patientForSource[resourceFhir.source_id] = resourceFhir
      })
    }, error => {
      this.loading = false
    });


  }

  selectSource(selectedSource: Source){
    this.router.navigateByUrl(`/source/${selectedSource.id}`, {
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

  public gridOptions: GridStackOptions = {
    margin: 5,
    float: false,
    minRow: 1,
    acceptWidgets: false,
    alwaysShowResizeHandle: true,

    //these 2 options can be used to enable/disable editability
    // disableDrag: true,
    // disableResize: true
    // children: [
    //   // {x: 0, y: 0, minW: 2},
    //   // {x: 1, y: 1},
    //   // {x: 2, y: 2},
    // ],
  }

  public toggleEditableGrid() {
    this.gridEditDisabled = !this.gridEditDisabled;
    console.log('toggle - is disabled', this.gridEditDisabled)

    this.gridEditDisabled ? this.gridComp.grid?.disable(true) : this.gridComp.grid?.enable(true);

  }

  public dashboardItems: DashboardWidgetConfig[] = []
  /**
   * TEST dynamic grid operations - uses grid API directly (since we don't track structure that gets out of sync)
   */
  public add(gridComp: GridstackComponent) {
    // TODO: BUG the content doesn't appear until widget is moved around (or another created). Need to force
    // angular detection changes...
    // gridComp.grid?.addWidget({x:3, y:0, w:2, content:`item ${ids}`, id:String(ids++)});

    this.dashboardItems.push({x:3, y:0, width:4, height:3, id:String(ids++)} as DashboardWidgetConfig)

    // this.makeWidget(gridComp);
  }
  public delete(gridComp: GridstackComponent) {
    gridComp.grid?.removeWidget(gridComp.grid.engine.nodes[0]?.el!);
  }
  public modify(gridComp: GridstackComponent) {
    gridComp.grid?.update(gridComp.grid.engine.nodes[0]?.el!, {w:3})
  }
  public newLayout(gridComp: GridstackComponent) {
    this.dashboardItems = [
      {x:0, y:0, id:'1', width:4, height: 4, item_type: "calendar"}, // new size/constrain
      {x:4, y:0, id:'2', width:4, height: 4, item_type: "basic_table"},
      {x:8, y:0, id:'3', width:3, height: 3, item_type: "line_chart"}, // delete item
      {x:3, y:5, w:2, width:4, height:3}, // new item
    ]  as DashboardWidgetConfig[];
  }


  //
  // getRootNodeFromParsedComponent(component: any) {
  //   const componentFactory =
  //     this.componentFactoryResolver.resolveComponentFactory(component);
  //   let ref = this.vcRef?.createComponent(componentFactory);
  //
  //   const hostView = <EmbeddedViewRef<any>>ref?.hostView;
  //   return hostView.rootNodes[0];
  // }
  //
  // makeWidget(gridComp: GridstackComponent) {
  //   console.log('called makeWidget');
  //
  //   gridComp.grid?.el.appendChild(
  //     this.getRootNodeFromParsedComponent(DashboardItemComponent)
  //   );
  //   gridComp.grid?.makeWidget('#widget1');
  // }
}
