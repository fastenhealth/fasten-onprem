import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FastenDbService} from './fasten-db.service';
import {User} from '../../lib/models/fasten/user';
import {environment} from '../../environments/environment';
import {GetEndpointAbsolutePath} from '../../lib/utils/endpoint_absolute_path';
import {ResponseWrapper} from '../models/response-wrapper';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private _httpClient: HttpClient) {
  }


  public async IdpConnect(idp_type: string) {
    console.log("Connecting to external Idp")

    let fastenApiEndpointBase = GetEndpointAbsolutePath(globalThis.location,environment.fasten_api_endpoint_base)

    let resp = await this._httpClient.get<ResponseWrapper>(`${fastenApiEndpointBase}/auth/connect/${idp_type}`).toPromise()
    console.log(resp)

    const authorizeUrl = new URL(resp.data)
    authorizeUrl.searchParams.append('redirect_uri', window.location.href + '/callback/'+ idp_type ); //only auth/signup and /auth/signin urls are allowed
    window.location.href = authorizeUrl.toString();
  }

  public async IdpCallback(idp_type: string, id_token: string) {

    var payload = {
      id_token: id_token
    }

    let fastenApiEndpointBase = GetEndpointAbsolutePath(globalThis.location,environment.fasten_api_endpoint_base)

    let resp = await this._httpClient.post<ResponseWrapper>(`${fastenApiEndpointBase}/auth/callback/${idp_type}`, payload).toPromise()
    console.log(resp)

  }
}
