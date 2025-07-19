import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  private env: any = null;

  constructor(private http: HttpClient) {}

  public load() {
    return this.http.get('http://localhost:4200/api/env')
      .toPromise()
      .then(env => {
        this.env = env;
      });
  }

  public get(key: string): any {
    return this.env ? this.env[key] : null;
  }
}
