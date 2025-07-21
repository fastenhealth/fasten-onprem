import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { GetEndpointAbsolutePath } from '../../lib/utils/endpoint_absolute_path';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  private env: any = null;

  constructor(private http: HttpClient) {}

  public load() {
    const envEndpoint = `${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/env`;
    return this.http.get(envEndpoint)
      .toPromise()
      .then(env => {
        this.env = env;
      });
  }

  public get(key: string): any {
    return this.env ? this.env[key] : null;
  }
}
