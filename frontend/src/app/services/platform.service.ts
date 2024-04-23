import {Inject, Injectable} from '@angular/core';
import {HTTP_CLIENT_TOKEN} from '../dependency-injection';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {AuthService} from './auth.service';
import {MedicalSourcesFilter} from './medical-sources-filter.service';
import {Observable} from 'rxjs';
import {LighthouseSourceSearch} from '../models/lighthouse/lighthouse-source-search';
import {environment} from '../../environments/environment';
import {ResponseWrapper} from '../models/response-wrapper';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {

  constructor(private _httpClient: HttpClient) {}

  public convertCcdaToFhir(ccdaFile: File): Observable<File> {
    if(!ccdaFile || ccdaFile.size === 0){
      throw new Error("Invalid CCDA file")
    }

    const endpointUrl = new URL(`https://api.platform.fastenhealth.com/v1/app/ccda-to-fhir`);
    return this._httpClient.post<string>(endpointUrl.toString(), ccdaFile, { headers: {'Content-Type': 'application/cda+xml'} })
      .pipe(
        map((responseJson: string) => {
          return new File([JSON.stringify(responseJson)], ccdaFile.name + ".converted.json", {type: "application/json", lastModified: ccdaFile.lastModified || Date.now()})
        })
      );
  }

}
