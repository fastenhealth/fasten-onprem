import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { GetEndpointAbsolutePath } from '../../lib/utils/endpoint_absolute_path';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settings: any = null;

  constructor(private http: HttpClient) {}

  public load() {
    const settingsEndpoint = `${GetEndpointAbsolutePath(globalThis.location, environment.fasten_api_endpoint_base)}/settings`;
    return this.http.get(settingsEndpoint)
      .toPromise()
      .then(settings => {
        this.settings = settings;
      });
  }

  public get(key: string): any {
    return this.settings ? this.settings[key] : null;
  }
}
