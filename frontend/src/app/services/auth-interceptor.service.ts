import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor } from '@angular/common/http';
import { FastenApiService } from './fasten-api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService {

  constructor(private injector: Injector) { }

  intercept(req, next) {
    const fastenApiService = this.injector.get(FastenApiService);
    const fastenApiRequest = req.clone({
      // tslint:disable-next-line:max-line-length
      headers: req.headers.set('Authorization', 'Bearer ' + fastenApiService.token)
    });

    return next.handle(fastenApiRequest);

    //TODO: check if the response is 401, if so we should always redirect to /login
  }
}
