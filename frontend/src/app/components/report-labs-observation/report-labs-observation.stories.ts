import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ReportLabsObservationComponent } from './report-labs-observation.component'
import { PipesModule } from 'src/app/pipes/pipes.module';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';
import { IResourceRaw, ResourceFhir } from 'src/app/models/fasten/resource_fhir';
import { GlossaryLookupComponent } from '../glossary-lookup/glossary-lookup.component';
import { NgChartsModule } from 'ng2-charts';
import { HTTP_CLIENT_TOKEN } from 'src/app/dependency-injection';
import { HttpClient, HttpClientModule, HttpHandler } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of } from 'rxjs';

import R4Example1Json from "../../../lib/fixtures/r4/resources/observation/example1.json";
import { Html as GlossaryLookupHtml } from '../glossary-lookup/glossary-lookup.stories';
import { ObservationVisualizationComponent } from '../fhir-card/common/observation-visualization/observation-visualization.component';
import { fhirVersions } from 'src/lib/models/constants';
import { observationR4Factory } from 'src/lib/fixtures/factories/r4/resources/observation-r4-factory';


const withHttpClientProvider = (storyFunc, context) => {
  const { httpClientResp } = context.parameters;

  class MockHttpClient extends HttpClient {

    get(): Observable<any> {
      return of(httpClientResp)
    }
  }

  return moduleMetadata({ providers: [{ provide: HTTP_CLIENT_TOKEN, useClass: MockHttpClient }] })(
    storyFunc,
    context
  );
};

// More on how to set up stories at: https://storybook.js.org/docs/angular/writing-stories/introduction
const meta: Meta<ReportLabsObservationComponent> = {
  title: 'Components/ReportLabsObservation',
  component: ReportLabsObservationComponent,
  decorators: [
    withHttpClientProvider,
    moduleMetadata({
      imports: [PipesModule, GlossaryLookupComponent, NgChartsModule, RouterTestingModule, HttpClientModule, ObservationVisualizationComponent],
      declarations: [ NgbCollapse ],
      providers: [],
    })
  ],
  tags: ['autodocs'],
  render: (args: ReportLabsObservationComponent) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {
    observations: {
      control: { type: 'object' }
    },
    observationCode: {
      control: { type: 'text' }
    },
    observationTitle: {
      control: { type: 'text' }
    },
  },
};


export default meta;
type Story = StoryObj<ReportLabsObservationComponent>;

const observation: ResourceFhir = {
  source_id: '',
  source_resource_id: '',
  source_resource_type: 'Observation',
  fhir_version: '4',
  sort_title: 'sort',
  sort_date: new Date(),
  resource_raw: R4Example1Json,
};

const observation2: ResourceFhir = {
  source_id: '',
  source_resource_id: '',
  source_resource_type: 'Observation',
  fhir_version: '4',
  sort_title: 'sort',
  sort_date: new Date(),
  resource_raw: R4Example1Json,
};

// More on writing stories with args: https://storybook.js.org/docs/angular/writing-stories/args
export const Entry: Story = {
  args: {
    observations: [observation, observation2],
    observationCode: '788-0',
    observationTitle: 'Erythrocyte distribution width [Ratio] by Automated count',
  },
  parameters: {
    ...GlossaryLookupHtml.parameters
  }
};


const observation3: ResourceFhir = {
  source_id: '',
  source_resource_id: '',
  source_resource_type: 'Observation',
  fhir_version: '4',
  sort_title: 'sort',
  sort_date: new Date(),
  resource_raw: observationR4Factory.valueCodeableConcept().build() as IResourceRaw,
};

const observation4: ResourceFhir = {
  source_id: '',
  source_resource_id: '',
  source_resource_type: 'Observation',
  fhir_version: '4',
  sort_title: 'sort',
  sort_date: new Date(),
  resource_raw: observationR4Factory.valueCodeableConcept().build() as IResourceRaw,
};

export const CodableConcept: Story = {
  args: {
    observations: [observation3, observation4],
    observationCode: '788-0',
    observationTitle: 'Erythrocyte distribution width [Ratio] by Automated count',
  },
  parameters: {
    ...GlossaryLookupHtml.parameters
  }
};
