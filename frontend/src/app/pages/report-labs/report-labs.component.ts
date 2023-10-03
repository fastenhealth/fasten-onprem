import { Component, OnInit } from '@angular/core';
import {FastenApiService} from '../../services/fasten-api.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ResourceFhir} from '../../models/fasten/resource_fhir';
import * as fhirpath from 'fhirpath';
import {Observable} from 'rxjs';
import {flatMap, map} from 'rxjs/operators';
import {ResponseWrapper} from '../../models/response-wrapper';
import {ActivatedRoute} from '@angular/router';

class ObservationGroup {[key: string]: ResourceFhir[]}
class ObservationGroupInfo {
  observationGroups: ObservationGroup = {}
  observationGroupTitles: {[key: string]: string} = {}
}
class LabResultCodeByDate {
  label: string //lab result coding (system|code)
  value: string //lab result date
}


@Component({
  selector: 'app-report-labs',
  templateUrl: './report-labs.component.html',
  styleUrls: ['./report-labs.component.scss']
})
export class ReportLabsComponent implements OnInit {
  loading: boolean = false

  currentPage: number = 0
  pageSize: number = 10
  allObservationGroups: string[] = []


  //currentPage data
  observationGroups: ObservationGroup = {}
  observationGroupTitles: {[key: string]: string} = {}

  isEmptyReport = false

  diagnosticReports: ResourceFhir[] = []

  constructor(
    private fastenApi: FastenApiService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.loading = true

    this.populateReports()

    this.findLabResultCodesSortedByLatest().subscribe((data) => {
      // this.loading = false
        console.log("ALL lab result codes", data)
      this.allObservationGroups = data.map((item) => item.label)
      return this.populateObservationsForCurrentPage()
    })
  }

  //using the current list of allObservationGroups, retrieve a list of observations, group them by observationGroup, and set the observationGroupTitles
  populateObservationsForCurrentPage(){

    let observationGroups = this.allObservationGroups.slice(this.currentPage * this.pageSize, (this.currentPage + 1) * this.pageSize)

    this.loading = true
    this.getObservationsByCodes(observationGroups).subscribe((data) => {
      this.loading = false
      this.observationGroups = data.observationGroups
      this.observationGroupTitles = data.observationGroupTitles

      this.isEmptyReport = !!!Object.keys(this.observationGroups).length
    }, error => {
      this.loading = false
      this.isEmptyReport = true
    })

  }

  //get a list of all lab codes associated with a diagnostic report
  findLabResultCodesFilteredToReport(diagnosticReport: ResourceFhir): Observable<LabResultCodeByDate[]> {
    return null
  }

  //get a list of all unique lab codes ordered by latest date
  findLabResultCodesSortedByLatest(): Observable<LabResultCodeByDate[]> {
    return this.fastenApi.queryResources({
      select: [],
      from: "Observation",
      where: {
        "code": "http://loinc.org|,urn:oid:2.16.840.1.113883.6.1|",
      },
      aggregations: {
        order_by: {
          field: "sort_date",
          fn: "max"
        },
        group_by: {
          field: "code",
        }
      }
    })
    .pipe(
        map((response: ResponseWrapper) => {
          return response.data as LabResultCodeByDate[]
        }),
    )
  }


  //get a list of the last 10 lab results
  populateReports(){
    return this.fastenApi.queryResources({
      select: ["*"],
      from: "DiagnosticReport",
      where: {
        "category": "http://terminology.hl7.org/CodeSystem/v2-0074|LAB",
      },
      limit: 10,
    }).subscribe(results => {
      this.diagnosticReports = results.data
    })
  }

  isEmpty(obj: any) {
    return Object.keys(obj).length === 0;
  }

  //private methods

  //get a list of observations that have a matching code
  private getObservationsByCodes(codes: string[]): Observable<ObservationGroupInfo>{
    return this.fastenApi.queryResources({
      select: [],
      from: "Observation",
      where: {
        "code": codes.join(","),
      }
    }).pipe(
      map((response: ResponseWrapper) => {

        let observationGroups: ObservationGroup = {}
        let observationGroupTitles: {[key: string]: string} = {}

        //loop though all observations, group by "code.system": "http://loinc.org"
        for(let observation of response.data){
          let observationGroup = fhirpath.evaluate(observation.resource_raw, "Observation.code.coding.where(system='http://loinc.org').first().code")[0]
          observationGroups[observationGroup] = observationGroups[observationGroup] ? observationGroups[observationGroup] : []
          observationGroups[observationGroup].push(observation)

          if(!observationGroupTitles[observationGroup]){
            observationGroupTitles[observationGroup] = fhirpath.evaluate(observation.resource_raw, "Observation.code.coding.where(system='http://loinc.org').first().display")[0]
          }
        }

        return {
          observationGroups: observationGroups,
          observationGroupTitles: observationGroupTitles
        }
      })
    );
  }

}
