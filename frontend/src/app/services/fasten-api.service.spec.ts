import { TestBed } from '@angular/core/testing';

import { FastenApiService } from './fasten-api.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {HTTP_CLIENT_TOKEN} from '../dependency-injection';
import {HttpClient} from '@angular/common/http';
import {DashboardWidgetQuery} from '../models/widget/dashboard-widget-query';

describe('FastenApiService', () => {
  let service: FastenApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ]
    });
    service = TestBed.inject(FastenApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('fhirPathMapQueryFn should generate a valid select map with aliases', () => {
    //setup
    let patient = {
      "resourceType": "Patient",
      "id": "example",
      "address": [
        {
          "use": "home",
          "city": "PleasantVille",
          "type": "both",
          "state": "Vic",
          "line": [
            "534 Erewhon St"
          ],
          "postalCode": "3999",
          "period": {
            "start": "1974-12-25"
          },
          "district": "Rainbow",
          "text": "534 Erewhon St PeasantVille, Rainbow, Vic  3999"
        }
      ]
    }

    let query = {
      // use: string
      select: ['address.use', "address.where(type='both').state as state"],
      from: 'Patient',
      where: {'id':'example'}

    } as DashboardWidgetQuery


    let query2 = {
      // use: string
      select: ['*', "address.where(type='both').use | address.city as joined"],
      from: 'Patient',
      where: {'id':'example'}

    } as DashboardWidgetQuery


    //test
    let fn = service.fhirPathMapQueryFn(query)
    expect(fn(patient)).toEqual({ "address.use": [ 'home' ], "state": [ 'Vic' ], 'id': 'example', 'resourceType': 'Patient' })

    // let fn2 = service.fhirPathMapQueryFn(query2)
    let fn2 = service.fhirPathMapQueryFn(query2)
    expect(fn2(patient)).toEqual({
      "joined": [ 'home', 'PleasantVille' ],
      "*": {
        "resourceType": "Patient",
        "id": "example",
        "address": [
          {
            "use": "home",
            "city": "PleasantVille",
            "type": "both",
            "state": "Vic",
            "line": [
              "534 Erewhon St"
            ],
            "postalCode": "3999",
            "period": {
              "start": "1974-12-25"
            },
            "district": "Rainbow",
            "text": "534 Erewhon St PeasantVille, Rainbow, Vic  3999"
          }
        ]
      }, 'id': 'example', 'resourceType': 'Patient' })


  });
});
