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


  /**
   * Signup  (and Signin) both require an "online" user.
   * @param newUser
   * @constructor
   */
  public async Connect(idpType: string) {
    console.log("Connecting to external Idp")

    let fastenApiEndpointBase = GetEndpointAbsolutePath(globalThis.location,environment.fasten_api_endpoint_base)

    let resp = await this._httpClient.get<ResponseWrapper>(`${fastenApiEndpointBase}/auth/connect/${idpType}`).toPromise()
    console.log(resp)

    const authorizeUrl = new URL(resp.data)
    authorizeUrl.searchParams.append('redirect_uri', window.location.href);
    window.location.href = authorizeUrl.toString();
  }
}
