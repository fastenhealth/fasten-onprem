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

  it('_fhirPathFilterQueryFn should generate a valid filter function', () => {
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
      select: ['*'],
      from: 'Patient',
      where: ["id = 'example'"]

    } as DashboardWidgetQuery


    let query2 = {
      // use: string
      select: ['*'],
      from: 'Patient',
      where: ["id = 'example2'"]

    } as DashboardWidgetQuery


    //test
    let fn = service.fhirPathFilterQueryFn(query)
    expect(fn(patient)).toBeTrue();

    let fn2 = service.fhirPathFilterQueryFn(query2)
    expect(fn2(patient)).toBeFalse();
    //assert

  });


  it('_fhirPathFilterQueryFn should generate a valid filter function with complex condition', () => {
    //setup
    let observation = {
      "resourceType": "Observation",
      "id": "769170fc-99e9-7dd7-1d63-9f16899ffaad",
      "status": "final",
      "category": [ {
        "coding": [ {
          "system": "http://terminology.hl7.org/CodeSystem/observation-category",
          "code": "vital-signs",
          "display": "vital-signs"
        } ]
      } ],
      "code": {
        "coding": [ {
          "system": "http://loinc.org",
          "code": "29463-7",
          "display": "Body Weight"
        } ],
        "text": "Body Weight"
      },
      "subject": {
        "reference": "urn:uuid:801922ee-1eaa-70ab-96ef-27a226ba82d3"
      },
      "encounter": {
        "reference": "urn:uuid:c39c51fd-e7c6-347f-6d21-c0feb547ceb5"
      },
      "effectiveDateTime": "2013-12-30T18:39:50-05:00",
      "issued": "2013-12-30T18:39:50.256-05:00",
      "valueQuantity": {
        "value": 6.9,
        "unit": "kg",
        "system": "http://unitsofmeasure.org",
        "code": "kg"
      }
    }

    let query = {
      // use: string
      select: ['id'],
      from: 'Observation',
      where: ["(code.coding.where(system = 'http://loinc.org' and code = '29463-7') | code.coding.where(system = 'http://loinc.org' and code = '3141-9')).exists()"]

    } as DashboardWidgetQuery

    //test
    expect(service.fhirPathFilterQueryFn(query)(observation)).toBeTrue();

    //assert

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
      where: ["id = 'example'"]

    } as DashboardWidgetQuery


    let query2 = {
      // use: string
      select: ['*', "address.where(type='both').use | address.city as joined"],
      from: 'Patient',
      where: ["id = 'example2'"]

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
