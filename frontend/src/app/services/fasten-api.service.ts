import { Injectable } from '@angular/core';
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

@Injectable({
  providedIn: 'root'
})
export class FastenApiService {

  constructor(private _httpClient: HttpClient,  private router: Router, private authService: AuthService) {
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

  getResources(sourceResourceType?: string, sourceID?: string, sourceResourceID?: string, preloadRelated?: boolean): Observable<ResourceFhir[]> {
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
    if(preloadRelated){
      queryParams["preloadRelated"] = "true"
    }

    return this._httpClient.get<any>(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/resource/fhir`, {params: queryParams})
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("RESPONSE", response)
          return response.data as ResourceFhir[]
        })
      );
  }

  getResourceGraph(graphType?: string): Observable<{[resourceType: string]: ResourceFhir[]}> {
    if(!graphType){
      graphType = "MedicalHistory"
    }

    return this._httpClient.get<any>(`${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/secure/resource/graph/${graphType}`)
      .pipe(
        map((response: ResponseWrapper) => {
          console.log("RESPONSE", response)
          return response.data as {[name: string]: ResourceFhir[]}
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

      let binaryResourceId = attachmentModel.url

      //strip out the urn prefix (if this is an embedded id, eg. urn:uuid:2a35e080-c5f7-4dde-b0cf-8210505708f1)
      let urnPrefix = "urn:uuid:";
      if (binaryResourceId.startsWith(urnPrefix)) {
        // PREFIX is exactly at the beginning
        binaryResourceId = binaryResourceId.slice(urnPrefix.length);
      }

      //TODO: this is a naiive solution.
      //assumes that this is a relative or absolutie url in the following format:
      // 'Binary/xxx-xxx-xxx-xxx'
      // 'https://www.example.com/R4/path/Binary/xxx-xx-x-xx'
      let urlParts = binaryResourceId.split("Binary/");
      binaryResourceId = urlParts[urlParts.length - 1];

      return this.getResourceBySourceId(sourceId, binaryResourceId).pipe(
        map((resourceFhir: ResourceFhir) => {
          return new BinaryModel(resourceFhir.resource_raw)
        })
      )
    } else {
      return of(new BinaryModel(attachmentModel));
    }
  }

}
