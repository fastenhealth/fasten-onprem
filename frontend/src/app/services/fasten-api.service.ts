import {Inject, Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable, of} from 'rxjs';
import { Router } from '@angular/router';
import {map} from 'rxjs/operators';
import {ResponseWrapper} from '../models/response-wrapper';
import {Source} from '../models/fasten/source';
import {User} from '../models/fasten/user';
import {ResourceFhir} from '../models/fasten/resource_fhir';
import {SourceSummary} from '../models/fasten/source-summary';
import {Summary} from '../models/fasten/summary';
import {MetadataSource} from '../models/fasten/metadata-source';
import {AuthService} from './auth.service';
import {GetEndpointAbsolutePath} from '../../lib/utils/endpoint_absolute_path';
import {environment} from '../../environments/environment';
import {ResourceAssociation} from '../models/fasten/resource_association';
import {ValueSet} from 'fhir/r4';
import {AttachmentModel} from '../../lib/models/datatypes/attachment-model';
import {BinaryModel} from '../../lib/models/resources/binary-model';
import {HTTP_CLIENT_TOKEN} from "../dependency-injection";
import * as fhirpath from 'fhirpath';
import _ from 'lodash';
import {DashboardConfig} from '../models/widget/dashboard-config';
import {DashboardWidgetQuery} from '../models/widget/dashboard-widget-query';
import {ResourceGraphResponse} from '../models/fasten/resource-graph-response';
import { fetchEventSource } from '@microsoft/fetch-event-source';

@Injectable({
  providedIn: 'root'
})
export class FastenApiService {

  private _eventBus: Observable<Event>
  private _eventBusAbortController: AbortController

  constructor(@Inject(HTTP_CLIENT_TOKEN) private _httpClient: HttpClient,  private router: Router, private authService: AuthService) {
  }

  /*
  TERMINOLOGY SERVER/GLOSSARY ENDPOINTS
  */
  getGlossarySearchByCode(code: string, codeSystem: string): Observable<ValueSet> {

    const endpointUrl = new URL(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/glossary/code`);
    endpointUrl.searchParams.set('code', code);
    endpointUrl.searchParams.set('code_system', codeSystem);

    return this._httpClient.get<any>(endpointUrl.toString())
      .pipe(
        map((response: ValueSet) => {
          console.log("Glossary RESPONSE", response)
          return response
        })
      );
  }


  /*
  SECURE ENDPOINTS
  */

  //TODO: Any significant API changes here should also be reflected in EventBusService

  getDashboards(): Observable<DashboardConfig[]> {
    return this._httpClient.get<any>(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/dashboards`, )
      .pipe(
        map((response: ResponseWrapper) => {
          return response.data as DashboardConfig[]
        })
      );
  }

  getSummary(): Observable<Summary> {
    return this._httpClient.get<any>(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/summary`, )
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("Summary RESPONSE", response)
          return response.data as Summary
        })
      );
  }

  createSource(source: Source): Observable<any> {
    return this._httpClient.post<any>(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/source`, source)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("SOURCE RESPONSE", response)
          // @ts-ignore
          return {summary: response.data, source: response.source}
        })
      );
  }

  createManualSource(file: File): Observable<Source> {

    const formData = new FormData();
    formData.append('file', file);

    return this._httpClient.post<any>(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/source/manual`, formData)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("MANUAL SOURCE RESPONSE", response)
          return response.data as Source
        })
      );
  }

  getSources(): Observable<Source[]> {
    return this._httpClient.get<any>(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/source`)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("SOURCE RESPONSE", response)
          return response.data as Source[]
        })
      );
  }

  getSource(sourceId: string): Observable<Source> {
    return this._httpClient.get<any>(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/source/${sourceId}`)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("SOURCE RESPONSE", response)
          return response.data as Source
        })
      );
  }

  getSourceSummary(sourceId: string): Observable<SourceSummary> {
    return this._httpClient.get<any>(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/source/${sourceId}/summary`)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("SOURCE RESPONSE", response)
          return response.data as SourceSummary
        })
      );
  }

  syncSource(sourceId: string): Observable<any> {
    return this._httpClient.post<any>(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/source/${sourceId}/sync`, {})
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("SOURCE RESPONSE", response)
          return response.data
        })
      );
  }

  getResources(sourceResourceType?: string, sourceID?: string, sourceResourceID?: string, page?: number): Observable<ResourceFhir[]> {
    let queryParams = {}
    if(sourceResourceType){
      queryParams["sourceResourceType"] = sourceResourceType
    }
    if(sourceID){
      queryParams["sourceID"] = sourceID
    }

    if(sourceResourceID){
      queryParams["sourceResourceID"] = sourceResourceID
    }
    if(page !== undefined){
      queryParams["page"] = page
    }

    return this._httpClient.get<any>(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/resource/fhir`, {params: queryParams})
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("RESPONSE", response)
          return response.data as ResourceFhir[]
        })
      );
  }

  //TODO: add caching here, we dont want the same query to be run multiple times whne loading the dashboard.
  // we should also add a way to invalidate the cache when a source is synced
  //this function is special, as it returns the raw response, for processing in the DashboardWidgetComponent
  queryResources(query?: DashboardWidgetQuery): Observable<ResponseWrapper> {


    return this._httpClient.post<any>(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/query`, query)
  }

  getResourceGraph(graphType?: string, page?:number): Observable<ResourceGraphResponse> {
    if(!graphType){
      graphType = "MedicalHistory"
    }
    let queryParams = {}
    if(page){
      //the backend is 0 indexed, but the frontend is 1 indexed
      queryParams["page"] = page - 1
    }

    return this._httpClient.get<any>(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/resource/graph/${graphType}`, {params: queryParams})
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("RESPONSE", response)
          return response.data as ResourceGraphResponse
        })
      );
  }

  getResourceBySourceId(sourceId: string, resourceId: string): Observable<ResourceFhir> {

    return this._httpClient.get<any>(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/resource/fhir/${sourceId}/${resourceId}`)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("RESPONSE", response)
          return response.data as ResourceFhir
        })
      );
  }

  addDashboardLocation(location: string): Observable<ResponseWrapper> {
    return this._httpClient.post<any>(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/dashboards`, {
      "location": location
    })
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("RESPONSE", response)
          return response
        })
      );
  }

  //this method allows a user to manually group related FHIR resources together (conditions, encounters, etc).
  createResourceComposition(title: string, resources: ResourceFhir[]){
    return this._httpClient.post<any>(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/resource/composition`, {
      "resources": resources,
      "title": title,
    })
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("RESPONSE", response)
          return response.data
        })
      );
  }

  getBinaryModel(sourceId: string, attachmentModel: AttachmentModel): Observable<BinaryModel> {
    if(attachmentModel.url && !attachmentModel.data){
      //this attachment model is a refernce to a Binary model, we need to download it first.
      let urnPrefix = "urn:uuid:";
      let resourceType = "Binary"
      let resourceId = ""
      let binaryUrl = attachmentModel.url

      //strip out the urn prefix (if this is an embedded id, eg. urn:uuid:2a35e080-c5f7-4dde-b0cf-8210505708f1)
      if (binaryUrl.startsWith(urnPrefix)) {
        // PREFIX is exactly at the beginning
        resourceId = binaryUrl.slice(urnPrefix.length);
      } else if(binaryUrl.startsWith("http://") || binaryUrl.startsWith("https://")){
        //this is an absolute URL (which could be a FHIR url with Binary/xxx-xxx-xxx-xxx or a direct link to a file)
        let urlParts = binaryUrl.split("Binary/");
        if(urlParts.length > 1){
          //this url has a Binary/xxx-xxx-xxx-xxx part, so we can use that as the resource id
          resourceId = urlParts[urlParts.length - 1];
        } else {
          //this is a fully qualified url. we need to base64 encode the url and use that as the resource id
          resourceId = btoa(binaryUrl)
        }
      }

      return this.getResourceBySourceId(sourceId, resourceId).pipe(
        map((resourceFhir: ResourceFhir) => {
          return new BinaryModel(resourceFhir.resource_raw)
        })
      )
    } else {
      return of(new BinaryModel(attachmentModel));
    }
  }
}
