import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientVitalsWidgetComponent } from './patient-vitals-widget.component';
import {FastenApiService} from '../../services/fasten-api.service';
import {HTTP_CLIENT_TOKEN} from '../../dependency-injection';
import {HttpClient} from '@angular/common/http';
import {RouterTestingModule} from '@angular/router/testing';
import {of} from 'rxjs';
import patientVitalsObservationFixture from "../fixtures/patient_vitals_observation.json"
import patientVitalsPatientFixture from "../fixtures/patient_vitals_patient.json"

describe('PatientVitalsWidgetComponent', () => {
  let component: PatientVitalsWidgetComponent;
  let fixture: ComponentFixture<PatientVitalsWidgetComponent>;
  let mockedFastenApiService

  beforeEach(async () => {
    mockedFastenApiService = jasmine.createSpyObj('FastenApiService', ['queryResources'])

    await TestBed.configureTestingModule({
      imports: [ PatientVitalsWidgetComponent, RouterTestingModule ],
      providers: [
        {
          provide: FastenApiService,
          useValue: mockedFastenApiService
        },
        {
          provide: HTTP_CLIENT_TOKEN,
          useClass: HttpClient,
        },
      ]
    })
    .compileComponents();
    mockedFastenApiService.queryResources.and.returnValue(of(patientVitalsObservationFixture));


    fixture = TestBed.createComponent(PatientVitalsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  describe('vitalsProcessQueryResults', () => {
    describe('PatientVitals - PatientVitalsWidget', () => {
      it('should parse data', () => {
        expect(component).toBeTruthy();


        //test
        let processedVitalsQueryResponse = component.processQueryResourcesSelectClause(component.widgetConfig.queries[0].q, patientVitalsObservationFixture)
        let processedPatientQueryResponse = component.processQueryResourcesSelectClause(component.widgetConfig.queries[1].q, patientVitalsPatientFixture)
        component.chartProcessQueryResults([processedVitalsQueryResponse, processedPatientQueryResponse])

        //assert
        // name: string = ''
        // age: string = ''
        // gender: string = ''
        // vitalSigns: {
        //   display: string,
        //     code: string,
        //     date: string,
        //     value: string,
        //     unit: string
        // }[] = []


        expect(component.name).toEqual('Abraham100 Heller342')
        expect(component.age).toEqual('21 years')
        expect(component.gender).toEqual('male')
        expect(component.vitalSigns.length).toEqual(16)
      });
    })
  })
});
